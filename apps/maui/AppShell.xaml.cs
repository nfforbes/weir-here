namespace WeirHere.Maui;

public partial class AppShell : Shell
{
    public AppShell()
    {
        InitializeComponent();
        Routing.RegisterRoute("login", typeof(Views.LoginPage));
        Routing.RegisterRoute("jobs", typeof(Views.JobsPage));
        Routing.RegisterRoute("jobdetail", typeof(Views.JobDetailPage));
        Routing.RegisterRoute("dashboard", typeof(Views.DashboardPage));
    }
}
