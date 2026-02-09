"use server"

import { prisma } from "@/db"
import { revalidatePath } from "next/cache"

// --- STAFF ---

export async function getStaff() {
  return await prisma.staff.findMany({
    orderBy: { name: "asc" },
  })
}

export async function createStaff(data: { name: string; role: string; color?: string; email?: string; phone?: string }) {
  const staff = await prisma.staff.create({
    data: {
      name: data.name,
      role: data.role,
      color: data.color || "#3b82f6", // Default blue
      email: data.email,
      phone: data.phone,
    },
  })
  revalidatePath("/operations/team")
  return staff
}

export async function updateStaff(id: string, data: { name?: string; role?: string; color?: string; email?: string; phone?: string }) {
  const staff = await prisma.staff.update({
    where: { id },
    data,
  })
  revalidatePath("/operations/team")
  return staff
}

export async function deleteStaff(id: string) {
  await prisma.staff.delete({ where: { id } })
  revalidatePath("/operations/team")
}

// --- SHIFTS (ESCALAS) ---

export async function getShifts(startDate: Date, endDate: Date) {
  return await prisma.shift.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      staff: true,
    },
  })
}

export async function upsertShift(staffId: string, date: Date, data: { startTime: string; endTime: string; isDayOff: boolean }) {
  const shift = await prisma.shift.upsert({
    where: {
      staffId_date: {
        staffId,
        date,
      },
    },
    update: {
        startTime: data.startTime,
        endTime: data.endTime,
        isDayOff: data.isDayOff,
    },
    create: {
        staffId,
        date,
        startTime: data.startTime,
        endTime: data.endTime,
        isDayOff: data.isDayOff,
    },
  })
  revalidatePath("/operations/team")
  return shift
}

// --- TASKS (TAREFAS) ---

export async function getTasks(date: Date) {
    // Definir intervalo do dia para buscar tarefas
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    return await prisma.task.findMany({
        where: {
            date: {
                gte: start,
                lte: end
            }
        },
        include: {
            staff: true,
            checklist: true
        },
        orderBy: {
            startTime: 'asc'
        }
    })
}

export async function createTask(data: { 
    title: string; 
    date: Date; 
    staffId?: string; 
    roomId?: string; 
    description?: string;
    checklist?: string[] 
}) {
    const task = await prisma.task.create({
        data: {
            title: data.title,
            date: data.date,
            description: data.description,
            staffId: data.staffId,
            roomId: data.roomId,
            checklist: data.checklist ? {
                create: data.checklist.map(item => ({ text: item, checked: false }))
            } : undefined
        }
    })
    revalidatePath("/operations/team")
    return task
}

export async function toggleChecklistItem(itemId: string, checked: boolean) {
    const item = await prisma.checklistItem.update({
        where: { id: itemId },
        data: { checked }
    })
    
    // Verificar se todos os itens foram marcados para completar a tarefa automaticamente?
    // Por enquanto deixamos manual ou via botão "Concluir" explícito
    
    return item
}

export async function toggleTaskCompletion(taskId: string, completed: boolean) {
    const task = await prisma.task.update({
        where: { id: taskId },
        data: { 
            completed,
            completedAt: completed ? new Date() : null
        }
    })
    revalidatePath("/operations/team")
    return task
}
