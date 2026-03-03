namespace WeirHere.Maui.Models;

public class Job
{
    [System.Text.Json.Serialization.JsonPropertyName("_id")]
    public string? Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string EmploymentType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Responsibilities { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;
    public string HowToApply { get; set; } = string.Empty;
    public SalaryRange? SalaryRange { get; set; }
    public List<string> Categories { get; set; } = new();
    public List<string> Tags { get; set; } = new();
    public string? ExpiresAt { get; set; }
    public List<ScreeningQuestion> ScreeningQuestions { get; set; } = new();
    public List<string> Skills { get; set; } = new();
    public List<string> Benefits { get; set; } = new();
    public string? PostedBy { get; set; }
    public string? CreatedAt { get; set; }
    public string? UpdatedAt { get; set; }
}

public class SalaryRange
{
    public decimal Min { get; set; }
    public decimal Max { get; set; }
    public string Currency { get; set; } = "USD";
}

public class ScreeningQuestion
{
    public string Id { get; set; } = string.Empty;
    public string Question { get; set; } = string.Empty;
    public string Type { get; set; } = "text";
    public bool Required { get; set; }
}
