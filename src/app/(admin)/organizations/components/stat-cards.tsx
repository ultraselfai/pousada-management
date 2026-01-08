import { Card, CardContent } from "@/components/ui/card"
import { Building2, Users, CheckCircle, FlaskConical, TrendingUp, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'

interface StatsProps {
  stats: {
    totalClients: number
    activeClients: number
    totalMembers: number
    sandboxCount: number
  }
}

export function StatCards({ stats }: StatsProps) {
  const metrics = [
    {
      title: 'Total de Clientes',
      current: stats.totalClients.toString(),
      icon: Building2,
      description: 'Organizações cadastradas',
    },
    {
      title: 'Clientes Ativos',
      current: stats.activeClients.toString(),
      icon: CheckCircle,
      description: 'Em produção',
      highlight: true,
    },
    {
      title: 'Total de Membros',
      current: stats.totalMembers.toString(),
      icon: Users,
      description: 'Usuários em todas as orgs',
    },
    {
      title: 'Sandboxes',
      current: stats.sandboxCount.toString(),
      icon: FlaskConical,
      description: 'Ambientes de teste',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index} className={cn('border', metric.highlight && 'border-green-500/50')}>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <metric.icon className={cn(
                'size-6',
                metric.highlight ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
              )} />
              {metric.highlight && (
                <Badge
                  variant='outline'
                  className='border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400'
                >
                  <TrendingUp className='me-1 size-3' />
                  Ativo
                </Badge>
              )}
            </div>

            <div className='space-y-2'>
              <p className='text-muted-foreground text-sm font-medium'>{metric.title}</p>
              <div className='text-2xl font-bold'>{metric.current}</div>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <span>{metric.description}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
