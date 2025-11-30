import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select } from '../components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'

export default function TaskForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Pending'
  })

  useEffect(() => {
    if (isEdit) {
      fetchTask()
    }
  }, [id])

  const fetchTask = async () => {
    try {
      const res = await api.get(`/api/tasks/${id}`)
      setFormData({
        title: res.data.title,
        description: res.data.description,
        status: res.data.status
      })
    } catch (error) {
      console.error('Failed to fetch task:', error)
      navigate('/dashboard')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit) {
        await api.put(`/api/tasks/${id}`, formData)
      } else {
        await api.post('/api/tasks', formData)
      }
      navigate('/dashboard')
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to save task')
      setErrorDialogOpen(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <Card>
        <CardHeader className="px-4 sm:px-6 pt-6 sm:pt-6">
          <CardTitle className="text-xl sm:text-2xl">{isEdit ? 'Edit Task' : 'Create New Task'}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6 sm:pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm sm:text-base">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm sm:text-base">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={5}
                className="text-sm sm:text-base resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm sm:text-base">Status</Label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="text-sm sm:text-base"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setErrorDialogOpen(false)} className="w-full sm:w-auto">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

