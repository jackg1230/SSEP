function NotificationSystem({ notifications }) {
    return (
      <div className="notifications">
        {notifications.map((notification, index) => (
          <div key={index} className="notification">
            {notification.message}
          </div>
        ))}
      </div>
    );
  }