export const getSubscriptionStatus = (expiryDate: Date) => {
  const today = new Date();

  const daysLeft = Math.ceil(
    (expiryDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return {
    daysLeft,
    isExpired: daysLeft < 0,
    expiresToday: daysLeft === 0,
    remind3Days: daysLeft === 3,
    remind1Day: daysLeft === 1,
  };
};
