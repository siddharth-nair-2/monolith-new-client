"use client";

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Users, Mail, Plus, X, Send, UserPlus, Clock, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const teamInviteSchema = z.object({
  emails: z.string().min(1, 'Please add at least one email address'),
  role: z.enum(['member', 'admin']),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
})

type TeamInviteFormData = z.infer<typeof teamInviteSchema>

export default function InviteTeamPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [emailList, setEmailList] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState('')
  const [inviteQuota] = useState({ used: 3, limit: 10 }) // Mock quota

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<TeamInviteFormData>({
    resolver: zodResolver(teamInviteSchema),
    mode: 'onChange',
    defaultValues: {
      role: 'member'
    }
  })

  const addEmail = () => {
    if (emailInput.trim() && !emailList.includes(emailInput.trim())) {
      const newList = [...emailList, emailInput.trim()]
      setEmailList(newList)
      setValue('emails', newList.join(', '))
      setEmailInput('')
    }
  }

  const removeEmail = (email: string) => {
    const newList = emailList.filter(e => e !== email)
    setEmailList(newList)
    setValue('emails', newList.join(', '))
  }

  const handleBulkEmailInput = (value: string) => {
    // Parse comma-separated or line-separated emails
    const emails = value
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'))

    setEmailList(emails)
    setValue('emails', emails.join(', '))
  }

  const onSubmit = async (data: TeamInviteFormData) => {
    if (emailList.length === 0) {
      return
    }

    setIsLoading(true)
    try {
      // Send invites via API
      const inviteResponse = await fetch('/api/invites/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: emailList,
          role: data.role,
          message: data.message,
        }),
      })

      if (!inviteResponse.ok) {
        const errorData = await inviteResponse.json()
        throw new Error(errorData.message || 'Failed to send invites')
      }

      const inviteResult = await inviteResponse.json()
      console.log('Invites sent:', inviteResult)

      // Mark invite_team step as completed
      const completeResponse = await fetch('/api/onboarding/complete-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'invite_team',
          step_data: {
            invites_sent: inviteResult.invited,
            failed_invites: inviteResult.failed,
          },
        }),
      })

      if (!completeResponse.ok) {
        console.warn('Failed to mark step as completed')
      }

      // Redirect back to onboarding dashboard
      router.push('/onboarding')
    } catch (error) {
      console.error('Error sending invites:', error)
      // Show error to user (you could add error state here)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    try {
      // Mark step as skipped
      await fetch('/api/onboarding/skip-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'invite_team',
        }),
      })
    } catch (error) {
      console.warn('Failed to mark step as skipped')
    }
    
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#A3BC02]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#E1F179]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          className="border-b border-gray-100 bg-white/80 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/onboarding" className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Setup
                  </Link>
                </Button>
                <div className="h-6 w-px bg-gray-200" />
                <Link href="/" className="text-2xl font-serif text-[#3E4128] hover:text-[#A3BC02] transition-colors">
                  Mono<span className="underline decoration-[#A3BC02] decoration-2 underline-offset-2">l</span>ith
                </Link>
              </div>
              <Badge variant="outline">Invite Team</Badge>
            </div>
          </div>
        </motion.div>

        <div className="max-w-2xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg shadow-gray-500/10">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-[#A3BC02]/10 rounded-full">
                    <Users className="w-8 h-8 text-[#A3BC02]" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-serif text-[#3E4128]">Invite Your Team</CardTitle>
                <CardDescription className="text-lg">
                  Get your team started by sending them invitations to join your workspace.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Quota Display */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Invite Quota</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {inviteQuota.used} of {inviteQuota.limit} invites used this hour
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email Input */}
                  <div className="space-y-3">
                    <Label>Team Member Emails</Label>

                    {/* Single email input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter email address"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addEmail()
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={addEmail}
                        disabled={!emailInput.trim()}
                        className="bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <Separator className="my-4" />

                    {/* Bulk email input */}
                    <div className="space-y-2">
                      <Label htmlFor="bulkEmails">Or paste multiple emails (comma or line separated)</Label>
                      <Textarea
                        id="bulkEmails"
                        placeholder="john@company.com, jane@company.com&#10;mike@company.com"
                        rows={3}
                        onChange={(e) => handleBulkEmailInput(e.target.value)}
                        className="resize-none"
                      />
                    </div>

                    {/* Email list */}
                    {emailList.length > 0 && (
                      <div className="space-y-2">
                        <Label>Inviting ({emailList.length} people):</Label>
                        <div className="max-h-32 overflow-y-auto space-y-1 p-3 bg-gray-50 rounded-lg">
                          {emailList.map((email, index) => (
                            <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                              <span className="text-sm">{email}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEmail(email)}
                                className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label>Role for invited members</Label>
                    <Select onValueChange={(value: 'member' | 'admin') => setValue('role', value)} defaultValue="member">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">
                          <div className="flex flex-col items-start">
                            <span>Member</span>
                            <span className="text-xs text-gray-500">Can access and search content</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex flex-col items-start">
                            <span>Admin</span>
                            <span className="text-xs text-gray-500">Can manage team and settings</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Custom Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Add a personal message to your invitation..."
                      rows={3}
                      {...register('message')}
                      className="resize-none"
                    />
                    <p className="text-sm text-gray-500">
                      {watch('message')?.length || 0}/500 characters
                    </p>
                  </div>

                  {/* Preview */}
                  {emailList.length > 0 && (
                    <div className="p-4 bg-[#A3BC02]/5 border border-[#A3BC02]/20 rounded-lg">
                      <h4 className="font-medium text-[#3E4128] mb-2">Invitation Preview</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• {emailList.length} people will be invited</p>
                        <p>• They will be assigned the <strong>{watch('role')}</strong> role</p>
                        <p>• Invitations expire in 7 days</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleSkip}
                    >
                      Skip for Now
                    </Button>
                    <Button
                      type="submit"
                      disabled={emailList.length === 0 || isLoading}
                      className="flex-1 bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending Invites...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Send Invites ({emailList.length})
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}