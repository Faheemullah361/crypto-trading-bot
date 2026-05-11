package com.cryptotrading.thread;

import com.cryptotrading.model.Order;

import java.util.LinkedList;
import java.util.Queue;

/**
 * Thread-safe Order Queue demonstrating SYNCHRONIZATION
 * Producer-Consumer pattern with wait/notify
 */
public class OrderQueue {
    private Queue<Order> orders;
    private int capacity;
    
    public OrderQueue(int capacity) {
        this.orders = new LinkedList<>();
        this.capacity = capacity;
    }
    
    /**
     * SYNCHRONIZATION: Producer method with wait/notify
     */
    public synchronized void addOrder(Order order) throws InterruptedException {
        while (orders.size() >= capacity) {
            System.out.println("Queue full, waiting...");
            wait(); // Wait until space is available
        }
        
        orders.add(order);
        System.out.println("Order added: " + order.getType() + " - Queue size: " + orders.size());
        notifyAll(); // Notify consumers
    }
    
    /**
     * SYNCHRONIZATION: Consumer method with wait/notify
     */
    public synchronized Order takeOrder() throws InterruptedException {
        while (orders.isEmpty()) {
            System.out.println("Queue empty, waiting...");
            wait(); // Wait until order is available
        }
        
        Order order = orders.poll();
        System.out.println("Order taken: " + order.getType() + " - Queue size: " + orders.size());
        notifyAll(); // Notify producers
        return order;
    }
    
    /**
     * SYNCHRONIZATION: Thread-safe peek
     */
    public synchronized Order peekOrder() {
        return orders.peek();
    }
    
    /**
     * SYNCHRONIZATION: Thread-safe size check
     */
    public synchronized int size() {
        return orders.size();
    }
    
    /**
     * SYNCHRONIZATION: Thread-safe isEmpty check
     */
    public synchronized boolean isEmpty() {
        return orders.isEmpty();
    }
    
    /**
     * SYNCHRONIZATION: Thread-safe isFull check
     */
    public synchronized boolean isFull() {
        return orders.size() >= capacity;
    }
}
