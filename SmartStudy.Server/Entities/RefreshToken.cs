namespace SmartStudy.Server.Entities
{
    public class RefreshToken
    {
        public int Id { get; set; }

        // Khóa ngoại
        public int UserId { get; set; }
        public User? User { get; set; }

        // Lưu hash token
        public required string TokenHash { get; set; }

        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; }

        public DateTime? RevokedAt { get; set; }
        public string? ReplacedByTokenHash { get; set; }

        public bool IsRevoked => RevokedAt.HasValue;
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}
