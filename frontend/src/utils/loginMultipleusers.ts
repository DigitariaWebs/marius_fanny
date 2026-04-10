export const getRedirectPath = (role: string) => {
  switch (role) {
    case "admin":
      return "/dashboard";
    case "kitchen_staff":
    case "cuisinier":
      return "/staff/cuisinier";
    case "patissier":
      return "/staff/patissier";
    case "four":
      return "/staff/four";
    case "customerService":
    case "customer_service":
      return "/dashboard";
    case "deliveryDriver":
      return "/staff/delivery";
    case "vendeur":
      return "/staff/vendeur";
    case "pro":
      return "/pro";
    case "client":
    case "user":
      return "/mon-compte";
    default:
      return "/";
  }
};

