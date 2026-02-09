// Guest data utilities

import {
  Globe,
  Home,
  Instagram,
  MessageCircle,
  Facebook,
  Users,
  Share2,
  ShoppingCart,
  HelpCircle,
} from "lucide-react"

/**
 * Origens de hóspedes para filtros
 */
export const origins = [
  { value: "DIRECT", label: "Direto", icon: Home },
  { value: "BOOKING_COM", label: "Booking.com", icon: Globe },
  { value: "AIRBNB", label: "Airbnb", icon: Home },
  { value: "WHATSAPP", label: "WhatsApp", icon: MessageCircle },
  { value: "INSTAGRAM", label: "Instagram", icon: Instagram },
  { value: "FACEBOOK", label: "Facebook", icon: Facebook },
  { value: "INDICACAO", label: "Indicação", icon: Users },
  { value: "MOTOR_RESERVAS", label: "Motor de Reservas", icon: ShoppingCart },
  { value: "OUTRO", label: "Outro", icon: HelpCircle },
]

/**
 * Mapear origem para label legível
 */
export function getOriginLabel(origin: string): string {
  const found = origins.find((o) => o.value === origin)
  return found?.label ?? origin
}

/**
 * Mapear origem para ícone
 */
export function getOriginIcon(origin: string) {
  const found = origins.find((o) => o.value === origin)
  return found?.icon ?? HelpCircle
}
