import React, { useMemo } from 'react';
import { useClassSectionListViewModel } from './useClassSectionListViewModel';
import { Card, Table, Modal, FormInput, Badge, Pagination } from '../../../components/UI';
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle, XCircle, BookOpen, ChevronLeft } from 'lucide-react';
import { ClassSection } from '../../../models/ClassSection';
import { SearchableSelect } from '../../../components/SearchableSelect';

interface ClassSectionListViewProps {
  onTabChange?: (tab: string) => void;
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function ClassSectionListView({ onTabChange, triggerToast }: ClassSectionListViewProps) {
  const {
    classSections,
    subjects,
    teachers,
    departments,
    majors,
    semesters,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedSemesterId,
    setSelectedSemesterId,
    semesterIdFromUrl,
    clearSemesterFilter,
    selectedDepartmentId,
    setSelectedDepartmentId,
    selectedMajorId,
    setSelectedMajorId,
    selectedSubjectId,
    setSelectedSubjectId,
    page,
    setPage,
    pageSize,
    totalPages,
    totalElements,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    formData,
    errors,
    openAddModal,
    openEditModal,
    handleInputChange,
    handleSelectChange,
    handleSave,
    handleDelete,
    filteredSubjects,
    filteredMajorsForFilter
  } = useClassSectionListViewModel();

  const filteredMajors = useMemo(() => {
    if (!formData.departmentId) return [];
    return majors.filter(m => m.departmentId === formData.departmentId);
  }, [majors, formData.departmentId]);

  const handleSaveAction = () => {
    handleSave((msg) => triggerToast(msg, 'success'));
  };

  const columns = [
    {
      header: 'Mã Lớp HP',
      accessor: (item: ClassSection) => <span className="font-mono font-bold text-slate-800">{item.sectionCode}</span>
    },
    {
      header: 'Môn Học',
      accessor: (item: ClassSection) => <span className="font-medium text-slate-800">{item.subjectName}</span>
    },
    {
      header: 'Khoa / Ngành',
      accessor: (item: ClassSection) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-800">{item.departmentName || 'Chung'}</span>
          {item.majorName && <span className="text-xs text-slate-500">{item.majorName}</span>}
        </div>
      )
    },
    {
      header: 'Giảng Viên',
      accessor: (item: ClassSection) => <span className="text-sm text-slate-600">{item.teacherName}</span>
    },
    {
      header: 'Lịch Học',
      accessor: (item: ClassSection) => (
        <span className="text-xs text-slate-500">
          Thứ {item.weekday}, {item.startTime} - {item.endTime} ({item.room})
        </span>
      )
    },
    {
      header: 'Sĩ Số',
      accessor: (item: ClassSection) => (
        <span className="text-sm font-semibold text-slate-700">
          {item.enrolledCount || 0} / {item.capacity}
        </span>
      )
    },
    {
      header: 'Trạng Thái',
      accessor: (item: ClassSection) => (
        <Badge variant={item.status === 'ACTIVE' ? 'success' : 'danger'}>
          {item.status === 'ACTIVE' ? 'Đang mở' : 'Đã đóng'}
        </Badge>
      )
    },
    {
      header: 'Thao Tác',
      accessor: (item: ClassSection) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => openEditModal(item)}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id!, item.sectionCode, (msg) => triggerToast(msg, 'success'))}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  const currentSemester = semesterIdFromUrl ? semesters?.find(s => s.id === semesterIdFromUrl) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-col gap-1 mb-2">
            {semesterIdFromUrl && (
              <button
                onClick={() => {
                  clearSemesterFilter();
                  if (onTabChange) onTabChange('semesters');
                }}
                className="w-fit px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Quay lại chọn Kỳ
              </button>
            )}
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Quản Lý Lớp Học Phần {currentSemester ? `(${currentSemester.name})` : ''}
            </h2>
          </div>
          <p className="text-xs text-slate-500">Xem và hiệu chỉnh danh mục các lớp học phần</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={isLoading}
          className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Tạo Lớp HP Mới
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-700">Lỗi tải dữ liệu</p>
            <p className="mt-1 text-rose-600">{error}</p>
          </div>
        </div>
      )}

      {semesterIdFromUrl && (
        <Card className="p-4 bg-indigo-50/50 border border-indigo-100 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-indigo-900 font-medium">
              Có tổng cộng <strong className="text-indigo-700 text-base">{totalElements}</strong> lớp học phần được mở trong kỳ này.
            </p>
          </div>
        </Card>
      )}

      <Card className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã lớp hoặc tên môn học..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white"
          />
        </div>


        <div className="w-full">
          <SearchableSelect
            name="departmentFilter"
            value={selectedDepartmentId}
            onChange={(val) => setSelectedDepartmentId(val ? Number(val) : undefined)}
            disabled={isLoading}
            options={departments.map(d => ({ value: d.id!, label: d.name }))}
            placeholder="-- Tất cả Khoa --"
            allowClear
          />
        </div>

        <div className="w-full">
          <SearchableSelect
            name="majorFilter"
            value={selectedMajorId}
            onChange={(val) => setSelectedMajorId(val ? Number(val) : undefined)}
            disabled={isLoading}
            options={filteredMajorsForFilter.map(m => ({ value: m.id!, label: m.name }))}
            placeholder="-- Tất cả Ngành --"
            allowClear
          />
        </div>
      </Card>

      <Card className="relative min-h-[300px] flex flex-col">
        {isLoading && classSections.length === 0 ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium text-slate-600">Đang tải dữ liệu lớp học phần...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <Table data={classSections} columns={columns} emptyMessage="Không có lớp học phần nào." />
          </div>
        )}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
          pageSize={pageSize}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Cập Nhật Lớp Học Phần' : 'Thêm Lớp Học Phần Mới'}
        footer={
          <>
            <button
              onClick={handleSaveAction}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Lưu dữ liệu
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
          </>
        }
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Mã Lớp Học Phần"
              name="sectionCode"
              value={formData.sectionCode}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="VD: INT1001_1"
              error={errors.sectionCode}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Môn Học</label>
              <SearchableSelect
                name="subjectId"
                value={formData.subjectId}
                onChange={(val) => handleSelectChange('subjectId', val)}
                disabled={isLoading}
                options={filteredSubjects.map(s => ({ value: s.id!, label: `${s.code} - ${s.name}` }))}
                placeholder="-- Chọn môn học --"
                error={!!errors.subjectId}
              />
              {errors.subjectId && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.subjectId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Giảng Viên</label>
              <SearchableSelect
                name="teacherId"
                value={formData.teacherId}
                onChange={(val) => handleSelectChange('teacherId', val)}
                disabled={isLoading}
                options={teachers.map(t => ({ value: t.id!, label: t.fullName }))}
                placeholder="-- Chọn giảng viên --"
                error={!!errors.teacherId}
              />
              {errors.teacherId && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.teacherId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Khoa</label>
              <SearchableSelect
                name="departmentId"
                value={formData.departmentId || ''}
                onChange={(val) => {
                  handleSelectChange('departmentId', val ? Number(val) : undefined);
                  handleSelectChange('majorId', undefined);
                }}
                disabled={isLoading}
                options={departments.map(d => ({ value: d.id!, label: d.name }))}
                placeholder="-- Tất cả các Khoa (Môn dùng chung toàn trường) --"
                allowClear
                error={!!errors.departmentId}
              />
              {errors.departmentId && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.departmentId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Ngành</label>
              <SearchableSelect
                name="majorId"
                value={formData.majorId || ''}
                onChange={(val) => handleSelectChange('majorId', val ? Number(val) : undefined)}
                disabled={isLoading || !formData.departmentId}
                options={filteredMajors.map(m => ({ value: m.id!, label: m.name }))}
                placeholder={formData.departmentId ? "-- Chọn ngành (Tùy chọn) --" : "-- Vui lòng chọn Khoa trước --"}
                allowClear
              />
            </div>
            {!semesterIdFromUrl && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Học Kỳ</label>
                <SearchableSelect
                  name="semesterId"
                  value={formData.semesterId}
                  onChange={(val) => handleSelectChange('semesterId', val)}
                  disabled={isLoading}
                  options={semesters.map(s => ({ value: s.id!, label: s.name }))}
                  placeholder="-- Chọn học kỳ --"
                  error={!!errors.semesterId}
                />
                {errors.semesterId && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.semesterId}</p>}
              </div>
            )}

            <FormInput
              label="Sĩ Số Tối Đa"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleInputChange}
              disabled={isLoading}
              error={errors.capacity}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Ngày Bắt Đầu"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
              disabled={isLoading}
              error={errors.startDate}
            />
            <FormInput
              label="Ngày Kết Thúc"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
              disabled={isLoading}
              error={errors.endDate}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Thứ</label>
              <SearchableSelect
                name="weekday"
                value={formData.weekday}
                onChange={(val) => handleInputChange({ target: { name: 'weekday', value: Number(val) } } as any)}
                disabled={isLoading}
                options={[2, 3, 4, 5, 6, 7, 8].map(day => ({ value: day, label: day === 8 ? 'Chủ nhật' : `Thứ ${day}` }))}
                placeholder="-- Chọn thứ --"
              />
            </div>

            <FormInput
              label="Giờ Bắt Đầu"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleInputChange}
              disabled={isLoading}
              error={errors.startTime}
            />

            <FormInput
              label="Giờ Kết Thúc"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleInputChange}
              disabled={isLoading}
              error={errors.endTime}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Phòng Học"
              name="room"
              value={formData.room}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="VD: P301"
              error={errors.room}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Trạng Thái</label>
              <SearchableSelect
                name="status"
                value={formData.status || 'ACTIVE'}
                onChange={(val) => handleInputChange({ target: { name: 'status', value: val } } as any)}
                disabled={isLoading}
                options={[
                  { value: 'ACTIVE', label: 'Đang mở' },
                  { value: 'CANCELLED', label: 'Đã hủy' },
                  { value: 'COMPLETED', label: 'Đã đóng (Kết thúc)' }
                ]}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
