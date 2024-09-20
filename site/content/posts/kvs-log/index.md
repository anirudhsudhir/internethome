---
title: Building a log-structured key-value store in Rust
date: 2024-09-12
description: Inspired by Bitcask
tags: ["bitcask", "databases", "rust", "tech"]
collections: ["posts"]
toc: true
---

---

> This blog is WIP

# Introduction

This blog is about a log structured key-value store that I’ve been working on, inspired by Bitcask and written in Rust.

Link to the [Github Repo](https://github.com/anirudhsudhir/kvs)

I have been following the [PingCAP Talent Plan](https://github.com/pingcap/talent-plan/blob/master/courses/rust/README.md) guide. It breaks down the project into smaller building blocks and provides 5 sets of incremental tests. Highly recommended for learning about databases and Rust!

---

## What is Bitcask

[Bitcask paper](https://riak.com/assets/bitcask-intro.pdf)

> WIP

---

# Initial Implementation

> WIP

## Serialization format

`kvs` persists the commands to the disk in a binary format. The [MessagePack](https://msgpack.org/) format was chosen for its impressive serialization and deserialization performance as well as compact binary representations, while remaining easy to use.

---

# Major update: Log Compaction

The write-ahead log (WAL) appends new data to the log for every command. Older key-value pairs might be invalidated by newer entries or deletions. Log compaction is necessary to:

- Ensure efficient disk usage by removing stale entries
- Improve startup and recovery by reducing the number of entries required to be replayed to rebuild the in-memory index.

Use a similar storage format as `Bitcask`, where multiple files are present in the storage directory. The directory will consist of a single mutable file opened for appending the log entries and several immutable files holding records which can be read.

---

## The KVStore struct

1. `mem_index` - An in-memory index mapping keys to log pointers, currently a HashTable(can be swapped out later with a better data structure such as a SkipList)
2. `folder_path` - Path to the folder storing logs
3. `log_writer` - A write handle to the active log
4. `log_readers` - A set of readers (`Vec<BufReader>`) to access all logs - This minimises the file open overhead for repeated `GET` commands.

   - The downsides to this would be more memory usage and OS limit on file handles. Since the number of open files would not practically cross double digits, the extra memory usage is a useful tradeoff for fewer open and close operations. (References: [https://stackoverflow.com/questions/51026191/downsides-of-keeping-file-handles-open](https://stackoverflow.com/questions/51026191/downsides-of-keeping-file-handles-open), [https://stackoverflow.com/questions/6774724/why-python-has-limit-for-count-of-file-handles](https://stackoverflow.com/questions/6774724/why-python-has-limit-for-count-of-file-handles))

5. `compactable_bytes` - The number of redundant bytes that can be compacted in the current log

## Store initialisation

### Determine if the store is a new or existing one

Obtain directory entries for the given folder using `fs::read_dir()` and find the max value - use numbers for log filenames such as `1.db` and `2.db`

- If files exist - Existing store

  - Initialise all write and read handles
  - Replay logs to recreate the index
  - Update `compactable_bytes`

- For a fresh store
  - Create `1.db`
