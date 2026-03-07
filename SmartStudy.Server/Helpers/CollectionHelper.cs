namespace SmartStudy.Server.Helpers
{
    public static class CollectionHelper
    {
        public static void SyncCollection<TEntity, TDtp, TKey>
            (
                ICollection<TEntity> existingEntities,
                IEnumerable<TDtp> incomingDtos,
                Func<TEntity, TKey> entityKeySelector,
                Func<TDtp, TKey> dtoKeySelector,
                Action<TEntity, TDtp> updateAction,
                Func<TDtp, TEntity> createFunc
            )
        {
            // Chuyển incomingDtos thành List để tránh nhiều lần duyệt IEnumerable
            var dtoList = incomingDtos.ToList();

            foreach (var dto in dtoList) 
            {
                // Lấy khóa (Id) từ DTO
                var key = dtoKeySelector(dto);
                // Tìm entity tương ứng trong existingEntities dựa trên khóa
                var existing = existingEntities.FirstOrDefault
                    (e => EqualityComparer<TKey>.Default.Equals(key, entityKeySelector(e)));
                // Nếu tìm thấy -> cập nhật
                if(existing!=null)
                {
                    // Sử dụng hàm bên ngoài để cập nhật entity với dữ liệu từ DTO
                    updateAction(existing, dto);
                }
                // Nếu không tìm thấy -> tạo mới và thêm vào collection
                else
                {
                    // Nhờ hàm bên ngoài tạo entity mới từ DTO
                    var newEntity = createFunc(dto);
                    // Thêm entity mới vào collection
                    existingEntities.Add(newEntity);
                }
            }

            // Sau khi xử lý tất cả DTO, loại bỏ những entity không còn tương ứng với bất kỳ DTO nào
            var toRemove = existingEntities.Where
                (e => !dtoList.Any(dto => EqualityComparer<TKey>.Default.Equals(
                    entityKeySelector(e), dtoKeySelector(dto))))
                .ToList();
            foreach (var entity in toRemove)
            {
                existingEntities.Remove(entity);
            }
        }
    }
}
