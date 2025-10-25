import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Trash2, Stethoscope, Phone, Mail, Calendar, Building } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI, Doctor, PaginationMeta } from '@/services/adminApi';

export const AdminDoctorsTab: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
    const fetchDoctors = async (page: number = 1, search: string = '') => {
    setLoading(true);
    try {
      const data = await adminAPI.getDoctors({ page, limit: 5, search });
      setDoctors(data.doctors);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
      // Mock data for development
      setDoctors([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 5
      });
    } finally {
      setLoading(false);
    }
  };
   const handleSearch = () => {
    setCurrentPage(1);
    fetchDoctors(1, searchQuery);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchDoctors(page, searchQuery);
  };

  const handleRemoveDoctor = async (doctorId: string) => {
    if (!confirm('Are you sure you want to remove this doctor from the system?')) {
      return;
    }

    try {
      await adminAPI.removeDoctor(doctorId);
      toast.success('Doctor removed successfully');
      fetchDoctors(currentPage, searchQuery);
    } catch (error) {
      console.error('Error removing doctor:', error);
      toast.error('Failed to remove doctor');
    }
  };
   useEffect(() => {
    fetchDoctors();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, label: 'Pending' },
      APPROVED: { variant: 'default' as const, label: 'Approved' },
      REJECTED: { variant: 'destructive' as const, label: 'Rejected' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="mx-1"
        >
          {i}
        </Button>
      );
    }
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
          {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
          {pagination.totalItems} doctors
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {pages}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };
   return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Stethoscope className="w-5 h-5 mr-2" />
          Doctor Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search doctors by name, specialization, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            Search
          </Button>
        </div>

        {/* Doctors Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading doctors...
                  </TableCell>
                </TableRow>
              ) : doctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No doctors found
                  </TableCell>
                </TableRow>
              ) : (
                doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          License: {doctor.licenseNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 mr-1 text-muted-foreground" />
                          <span className="text-sm">{doctor.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-1 text-muted-foreground" />
                          <span className="text-sm">{doctor.contactNumber}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {doctor.specialization.map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="w-3 h-3 mr-1 text-muted-foreground" />
                        {doctor.department}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {doctor.yearsOfExperience} years
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(doctor.status)}</TableCell>
                    <TableCell>
                      {new Date(doctor.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveDoctor(doctor.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && renderPagination()}
      </CardContent>
    </Card>
  );
};