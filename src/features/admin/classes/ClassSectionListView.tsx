import React from 'react';
import { useClassSectionListViewModel, getClassStatus } from './useClassSectionListViewModel';
import { Card, Table, Modal, FormInput, Badge, TimePicker } from '../../../components/UI';
import { Plus, Search, Edit2, Trash2, Calendar } from 'lucide-react';

interface ClassSectionListViewProps {
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function ClassSectionListView({ triggerToast }: ClassSectionListViewProps) {
  const {
    classes,
    subjects,
    teachers,
    departments,
    majors,
    majorsForSelectedDept,
    formData,
    availableSubjectsForForm,
    errors,

    searchTerm,
    setSearchTerm,
    selectedDepartmentFilter,
    setSelectedDepartmentFilter,
    selectedMajorFilter,
    setSelectedMajorFilter,
    selectedSubjectFilter,
    setSelectedSubjectFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,

    isModalOpen,
    setIsModalOpen,
    editingClass,
    openAddModal,
    openEditModal,
    handleInputChange,
    handleTimeChange,
    handleSave,
    handleDelete
  } = useClassSectionListViewModel();

  const handleSaveAction = () => {
    handleSave((msg) => triggerToast(msg, 'success'));
  };

  const columns = [
    {
      header: 'Mã Lớp HP',
      accessor: (cls: any) => <span className="font-mono font-bold text-slate-800">{cls.id}</span>
    },
    {
      header: 'Môn Học',
      accessor: (cls: any) => (
        <div>
          <p className="font-semibold text-slate-800 text-sm leading-none">{cls.subjectName}</p>
          <span className="text-[10px] text-slate-400 font-mono">ID: {cls.subjectId} • {cls.credits} TC</span>
        </div>
      )
    },
    {
      header: 'Khoa',
      accessor: (cls: any) => {
        const majorObj = majors.find((m: any) => m.id === cls.majorId);
        const deptName = majorObj ? (departments.find(d => d.id === majorObj.departmentId)?.name || '') : '';
        return <span className="text-sm text-slate-600">{deptName || '—'}</span>;
      }
    },
    {
      header: 'Ngành áp dụng',
      accessor: (cls: any) => {
        const majorObj = majors.find((m: any) => m.id === cls.majorId);
        return majorObj ? <span className="text-sm font-medium text-slate-700">{majorObj.id} — {majorObj.name}</span> : <span className="text-sm text-slate-500">Chưa xác định</span>;
      }
    },
    {
      header: 'Giảng Viên',
      accessor: (cls: any) => <span className="text-sm font-medium text-slate-600">{cls.teacherName}</span>
    },
    {
      header: 'Thời Khóa Biểu',
      accessor: (cls: any) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>{cls.schedule}</span>
        </div>
      )
    },
    {
      header: 'Phòng',
      accessor: (cls: any) => <Badge variant="gray">P.{cls.room}</Badge>
    },
    {
      header: 'Trạng Thế',
      accessor: (cls: any) => {
        const status = getClassStatus(cls.startDate, cls.endDate);
        if (status === 'not_started') {
          return <Badge variant="warning">Chưa bắt đầu</Badge>;
        } else if (status === 'ongoing') {
          return <Badge variant="success">Đang diễn ra</Badge>;
        } else {
          return <Badge variant="danger">Đã kết thúc</Badge>;
        }
      }
    },
    {
      header: 'Sĩ Số',
      accessor: (cls: any) => (
        <span className="text-xs font-semibold text-slate-600">
          {cls.studentIds.length} / {cls.capacity}
        </span>
      )
    },
    {
      header: 'Thao Tác',
      accessor: (cls: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(cls)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(cls.id, (msg) => triggerToast(msg, 'success'))}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Lớp Học Phần</h2>
          <p className="text-xs text-slate-500">Mở lớp học phần, gán môn, phân giảng viên, xếp lịch học</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Mở Lớp Học Phần
        </button>
      </div>

      {/* Controller */}
      <Card className="p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo lớp, môn, giảng viên, phòng..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white"
          />
        </div>

        <div className="w-full sm:w-40">
          <select
            value={selectedDepartmentFilter}
            onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-600"
          >
            <option value="all">Tất cả khoa</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={selectedMajorFilter}
            onChange={(e) => setSelectedMajorFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-600"
          >
            <option value="all">Tất cả ngành</option>
            {majorsForSelectedDept.map((m: any) => (
              <option key={m.id} value={m.id}>{m.id} — {m.name}</option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-600"
          >
            <option value="all">Tất cả môn học</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-600"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="not_started">Chưa bắt đầu</option>
            <option value="ongoing">Đang diễn ra</option>
            <option value="ended">Đã kết thúc</option>
          </select>
        </div>
      </Card>

      {/* Table List */}
      <Card>
        <Table data={classes} columns={columns} emptyMessage="Không tìm thấy lớp học phần nào phù hợp." />
      </Card>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? 'Cập Nhật Lớp Học Phần' : 'Mở Lớp Học Phần Mới'}
        footer={
          <>
            <button
              onClick={handleSaveAction}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Lưu thông tin
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Mã Lớp Học Phần"
            name="id"
            value={formData.id}
            onChange={handleInputChange}
            disabled={!!editingClass}
            placeholder="Ví dụ: LHP001, COMP202..."
            error={errors.id}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Khoa</label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700"
              >
                <option value="">-- Chọn khoa --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Ngành áp dụng</label>
              <select
                name="majorId"
                value={formData.majorId}
                onChange={handleInputChange}
                disabled={!formData.departmentId}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700"
              >
                <option value="">-- Chọn ngành áp dụng --</option>
                {majors.filter(m => !formData.departmentId || m.departmentId === formData.departmentId).map((m) => (
                  <option key={m.id} value={m.id}>{m.id} — {m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Môn Học</label>
              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleInputChange}
                disabled={!formData.majorId}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700"
              >
                <option value="">-- Chọn môn học --</option>
                {availableSubjectsForForm.length === 0 && formData.majorId && <option value="">(Không có môn nào cho ngành này)</option>}
                {availableSubjectsForForm.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Giảng Viên Phân Công</label>
              <select
                name="teacherId"
                value={formData.teacherId}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700"
              >
                <option value="">-- Chọn giảng viên --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Ngày Trong Tuần</label>
              <select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700"
              >
                <option value={2}>Thứ Hai</option>
                <option value={3}>Thứ Ba</option>
                <option value={4}>Thứ Tư</option>
                <option value={5}>Thứ Năm</option>
                <option value={6}>Thứ Sáu</option>
                <option value={7}>Thứ Bảy</option>
                <option value={8}>Chủ Nhật</option>
              </select>
            </div>

            <FormInput
              label="Phòng Học"
              name="room"
              value={formData.room}
              onChange={handleInputChange}
              placeholder="Ví dụ: A102, B305..."
              error={errors.room}
            />
          </div>

          <TimePicker
            label="Khung Giờ Học"
            value={formData.timeSlot}
            onChange={handleTimeChange}
          />

          <FormInput
            label="Sĩ Số Tối Đa"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleInputChange}
            min={5}
            max={150}
            error={errors.capacity}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Ngày Bắt Đầu"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
              error={errors.startDate}
            />

            <FormInput
              label="Ngày Kết Thúc"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
              error={errors.endDate}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
