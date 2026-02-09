"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, CheckSquare, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

import { TeamOrgChart } from "./components/team-org-chart"
import { TeamCalendar } from "./components/team-calendar"
import { TeamTasks } from "./components/team-tasks"

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState("calendar")

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Equipe e Escalas</h1>
          <p className="text-muted-foreground">
            Gerencie funcionários, escalas de trabalho e tarefas diárias
          </p>
        </div>
        <div className="flex gap-2">
            {/* Botões de ação contextual dependendo da aba ativa poderiam vir aqui */}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendário & Escalas
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            Tarefas & Checklists
          </TabsTrigger>
          <TabsTrigger value="org" className="gap-2">
            <Users className="h-4 w-4" />
            Quadro de Funcionários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
            <TeamCalendar />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
            <TeamTasks />
        </TabsContent>

        <TabsContent value="org" className="space-y-4">
            <TeamOrgChart />
        </TabsContent>
      </Tabs>
    </div>
  )
}
