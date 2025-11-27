import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchTasks()
  }, [currentPage])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`/api/tasks?page=${currentPage}&limit=10`)
      setTasks(res.data.tasks)
      setTotalPages(res.data.totalPages)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const openDeleteDialog = (id) => {
    setTaskToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/tasks/${taskToDelete}`)
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
      fetchTasks()
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to delete task')
      setErrorDialogOpen(true)
      setDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px] text-sm sm:text-base">Loading...</div>
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">My Tasks</h1>
        <Button onClick={() => navigate('/task/new')} className="w-full sm:w-auto">
          Add New Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tasks found. Create your first task!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 mb-6">
            {tasks.map((task) => (
              <Card key={task._id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg sm:text-xl mb-2 break-words">{task.title}</CardTitle>
                      <p className="text-sm sm:text-base text-muted-foreground mb-3 break-words">{task.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                        <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'} className="w-fit">
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/task/edit/${task._id}`)}
                        className="h-9 w-9 sm:h-10 sm:w-10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user?.role === 'admin' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(task._id)}
                          className="h-9 w-9 sm:h-10 sm:w-10"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-9 sm:h-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-9 sm:h-10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

