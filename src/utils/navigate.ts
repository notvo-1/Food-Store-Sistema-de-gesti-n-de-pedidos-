export const navigate = {
  toLogin(): void {
    window.location.href = "/src/pages/auth/login/login.html";
  },
  toHomeStore(): void {
    window.location.href = "/src/pages/store/home/home.html";
  },
  toAdminDashboard(): void {
    window.location.href = "/src/pages/admin/adminHome/adminHome.html";
  },
  toPedidos(): void{
    window.location.href = "/src/pages/client/orders/orders.html";
  }
};