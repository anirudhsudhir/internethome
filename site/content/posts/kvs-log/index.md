---
title: Kvs Log
date: 2024-09-10
description: A Bitcask-like log structured key-value store in Rust
tags: ["databases", "rust", "tech"]
collections: ["posts"]
draft: true
toc: true
---

---

# Introduction

I recently began working on a Bitcask-like log structured key-value store in Rust. This post is a devlog of the project and summarises some of the problems, learnings and choices made.

[Github Repo](https://github.com/anirudhsudhir/kvs) and [Bitcask paper](https://riak.com/assets/bitcask-intro.pdf)

I have been following the [PingCAP Talent Plan](https://github.com/pingcap/talent-plan/blob/master/courses/rust/README.md) guide. It breaks down the project into smaller sections and provides no code except for 5 sets of incremental test cases. Highly recommended for learning about databases and Rust!

---

### Serialization format

`kvs` persists the commands to the disk in a binary format. The [MessagePack](https://msgpack.org/) format was chosen for its impressive serialization and deserialization performance as well as compact binary representations, while remaining easy to use.

---

### Log Compaction POC

The write-ahead log(WAL) appends new data to the log for every command. Older key-value pairs might be invalidated by newer entries or deletions. Log compaction is necessary to:

- Ensure efficient disk usage by removing stale entries
- Improve startup and recovery by reducing the number of entries required to be replayed to rebuild the in-memory index.

Use a similar storage format as `Bitcask`, where multiple files are present in the storage directory. The directory will consist of a single mutable file opened for appending the log entries and several immutable files holding records which can be read.

#### File storage format

##### Empty storage directory

- Create a field in `KvStore` holding current file number opened for writing such as `1.db` , `2.db` and move the store behind a mutex
- Create a field holding the number of commands written to the current file, which is incremented on every append. If appends exceed a certain value, start compaction in parallel (The compaction will not modify the current file or index until it completes).
  - Close the existing write `File` handle, create an new File and store its handle in `KvStore`and increment the file number field.
- For each key `GET` , read the in-memory index for the file holding the latest command updating the given key. For every `GET` , a file has to be opened and read.
  - An alternative approach would be to hold a `Vec` of all the read file handles, thereby minimising the file open overhead for repeated `GET` commands.
  - The downsides to this would be more memory usage and OS limit on file handles. Since the number of open files would not really cross double digits, it would not hit OS limits and the extra memory usage is a useful tradeoff for fewer open and close operations.
  - References: [https://stackoverflow.com/questions/51026191/downsides-of-keeping-file-handles-open](https://stackoverflow.com/questions/51026191/downsides-of-keeping-file-handles-open), [https://stackoverflow.com/questions/6774724/why-python-has-limit-for-count-of-file-handles](https://stackoverflow.com/questions/6774724/why-python-has-limit-for-count-of-file-handles)
- Store a file with the following metadata:
  - Name of the last file used for writing
  - Location of the cursor/file offset at the last write position
- Update this metadata file after every append

##### Storage directory with existing files

- Check if the metadata file exists. If it does not, treat it as an empty storage directory
- If it exists, replay the logs to build the in-memory index

#### Compacting logs

##### Compacting a single file

- On an average, a file containing 1000 commands with xx-character long keys and xx-character long values is about 100kB
- If the number of commands exceed an arbitrary value (1000), start compaction:
  - Replay the logs with an alternate handle (and cursor, ) and create another index storing the latest k-v data.
  - Serialise the index and flush it to disk.
- On a successful write, acquire the lock to the store and update the index with the new log pointers
  - If a key points to the current file being compacted, update the offset
  - If the key points to a future file, keep it unchanged
- Overwrite the existing file with the compacted file.

##### Merging multiple compacted logs

The above process compacts a file after a certain threshold. To ensure that updated keys are removed in the future and combine files of varying sizes, the logs are merged from the beginning to rebuild a compacted set of logs storing a similar number of commands.
