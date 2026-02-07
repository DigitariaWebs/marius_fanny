export const getRedirectPath = (role: string) => {
  switch (role) {
    case "admin":
      return "/dashboard";
    case "kitchen_staff":
      return "/staff/production";
    case "customer_service":
      return "/staff/commandes";
    case "client":
    default:
      return "/";
  }
};

