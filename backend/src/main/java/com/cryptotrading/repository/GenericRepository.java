package com.cryptotrading.repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Generic Repository demonstrating GENERICS pattern
 * Also shows SYNCHRONIZATION with ReadWriteLock
 * @param <T> Entity type
 * @param <ID> ID type
 */
public class GenericRepository<T, ID> {
    private Map<ID, T> storage;
    private ReadWriteLock lock;
    
    public GenericRepository() {
        this.storage = new ConcurrentHashMap<>();
        this.lock = new ReentrantReadWriteLock();
    }
    
    /**
     * LOCKS: Read lock for thread-safe reading
     */
    public T findById(ID id) {
        lock.readLock().lock();
        try {
            return storage.get(id);
        } finally {
            lock.readLock().unlock();
        }
    }
    
    /**
     * LOCKS: Read lock for getting all entities
     */
    public List<T> findAll() {
        lock.readLock().lock();
        try {
            return new ArrayList<>(storage.values());
        } finally {
            lock.readLock().unlock();
        }
    }
    
    /**
     * LOCKS: Write lock for thread-safe writing
     */
    public void save(ID id, T entity) {
        lock.writeLock().lock();
        try {
            storage.put(id, entity);
        } finally {
            lock.writeLock().unlock();
        }
    }
    
    /**
     * LOCKS: Write lock for deletion
     */
    public boolean deleteById(ID id) {
        lock.writeLock().lock();
        try {
            return storage.remove(id) != null;
        } finally {
            lock.writeLock().unlock();
        }
    }
    
    /**
     * SYNCHRONIZATION: Thread-safe count
     */
    public synchronized int count() {
        return storage.size();
    }
    
    /**
     * LOCKS: Write lock for clearing all data
     */
    public void clear() {
        lock.writeLock().lock();
        try {
            storage.clear();
        } finally {
            lock.writeLock().unlock();
        }
    }
    
    /**
     * GENERICS: Example of bounded type parameter
     */
    public <V extends Comparable<V>> List<T> findByValue(V value) {
        lock.readLock().lock();
        try {
            // This is just a demonstration of generic method with bounded type
            System.out.println("Searching for value: " + value);
            return new ArrayList<>(storage.values());
        } finally {
            lock.readLock().unlock();
        }
    }
}
