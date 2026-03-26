using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pgvector;
// Gọi thư viện pgvector vào đây

namespace SmartStudy.Server.Entities
{
    public class DocumentChunk
    {
        [Key]
        public int Id { get; set; }

        // Khóa ngoại trỏ về cái File gốc
        public int AssetId { get; set; }
        public Asset Asset { get; set; }

        // Lưu chữ để đưa cho AI đọc
        [Required]
        public string TextContent { get; set; } 

        // Lưu Vector để Postgres tìm kiếm siêu tốc
        // Chú ý: Gemini model mặc định trả về vector có độ dài 768 chiều
        [Column(TypeName = "vector(768)")] 
        public Vector Embedding { get; set; }
        
    }
}