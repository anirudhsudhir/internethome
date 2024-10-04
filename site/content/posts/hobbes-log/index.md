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

Link to the [Github Repo](https://github.com/anirudhsudhir/hobbes)

I have been following the [PingCAP Talent Plan](https://github.com/pingcap/talent-plan/blob/master/courses/rust/README.md) guide. It breaks down the project into smaller building blocks and provides 5 sets of incremental tests. Highly recommended for learning about databases and Rust!

---

## What is Bitcask

[Bitcask paper](https://riak.com/assets/bitcask-intro.pdf)

> WIP

---

# Initial Implementation

> WIP

## Serialization format

kvs persists the commands to the disk in a binary format. The [MessagePack](https://msgpack.org/) format was chosen for its impressive serialization and deserialization performance as well as compact binary representations, while remaining easy to use.

---

# Update: Log Compaction

The write-ahead log (WAL) appends new data to the log for every command. Older key-value pairs might be invalidated by newer entries or deletions. Log compaction is necessary to:

- Ensure efficient disk usage by removing stale entries
- Improve startup and recovery by reducing the number of entries to be replayed to rebuild the in-memory index.

Use a similar storage format as Bitcask - The storage directory will consist of a single mutable append-only log and several immutable read-only logs holding compacted records.

---

## The KVStore struct

1. mem_index - An in-memory index mapping keys to a ValueMetadata struct, currently a HashTable
2. logs_dir - Path to the folder storing logs
3. log_writer - A write handle to the active log
4. log_readers - A collection of readers (HashMap<u64, BufReader<File>>) to access all logs

- This approach avoids the file open overhead associated with repeated GET commands
- A potential downside to this would be increased memory usage and OS limit on open file handles. Since the number of open files would not practically cross double digits, the extra memory usage is a useful tradeoff for fewer open and close operations.

5. current_log_id - The id of the active mutable log

## The ValueMetadata struct

1. log_pointer - Offset to the start of the log command such as ‘SET x 5’
2. file_id - Name of the log containing the command

---

## Initialise the store

Determine if the store is a new or existing one
Obtain directory entries of the log folder using fs::read_dir()

- If entries present: Existing store

1. find the maximum value - use integers for log names such as 1.db and 2.db
2. Initialise all write and read handles
3. Replay logs to recreate the index

- For an empty store

1. Create 1.db and initialise the write handle

## Compaction

Compaction is kicked off when a log size hits a certain threshold, such as 10kB. All writes are made to a new log while the current log is compacted.

1. Lock KvStore
2. Update the log id and writer to a new file and add a reader to the log_readers collection
3. Replay the current logs and store the latest key-value pairs in a hashmap
4. Persist the key-value pairs in an updated log such as 5_compacted.db

- Clone the existing index and insert or update entries

5. Lock KVStore

- Rename x_compacted.db to x.db: This operation overwrites the stale log with the compacted log
- Replace the in-memory index
- Update the reader of the freshly compacted log

A potential problem with this compaction approach is that if a key update or delete command is appended to a newer log, the stale entry in the older log is not compacted.

A possible approach to solve this issue:

- Perform standard compaction of the current log when the file size hits a certain threshold
- For every 10th log compaction (if log_id % 10 == 0), perform combined compaction of all the logs - this feature has not been implemented yet.

---

# Update: Client-server architecture

> WIP
