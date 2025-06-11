// hooks/useNotifications.js
"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    console.log("Setting up notifications listener for user:", user.uid);

    // Create real-time listener
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        setNotifications(notificationsList);
        setUnreadCount(notificationsList.filter((n) => !n.read).length);
        setLoading(false);

        console.log(
          `Loaded ${notificationsList.length} notifications, ${
            notificationsList.filter((n) => !n.read).length
          } unread`
        );
      },
      (error) => {
        console.error("Error listening to notifications:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
        readAt: new Date(),
      });
      console.log("Marked notification as read:", notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = db.batch();
      notifications
        .filter((n) => !n.read)
        .forEach((notification) => {
          const notifRef = doc(db, "notifications", notification.id);
          batch.update(notifRef, { read: true, readAt: new Date() });
        });
      await batch.commit();
      console.log("Marked all notifications as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  };
}
