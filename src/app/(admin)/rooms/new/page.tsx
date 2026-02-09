"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BedDouble,
  Save,
  Plus,
  Trash2,
  Upload,
  Check,
  Loader2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput, parseCurrencyToNumber } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { createRoom } from "@/features/rooms";

const EQUIPMENT_OPTIONS = [
  { id: "tv", label: "TV", icon: "📺" },
  { id: "ar", label: "Ar-condicionado", icon: "❄️" },
  { id: "frigobar", label: "Frigobar", icon: "🧊" },
  { id: "cofre", label: "Cofre", icon: "🔐" },
  { id: "wifi", label: "Wi-Fi", icon: "📶" },
  { id: "secador", label: "Secador de cabelo", icon: "💨" },
  { id: "banheira", label: "Banheira", icon: "🛁" },
  { id: "varanda", label: "Varanda", icon: "🏞️" },
  { id: "vista-piscina", label: "Vista para piscina", icon: "🏊" },
  { id: "amenities", label: "Kit amenities", icon: "🧴" },
];

const BED_TYPES = [
  { type: "casal", label: "Cama de Casal", icon: "🛏️" },
  { type: "solteiro", label: "Cama de Solteiro", icon: "🛏️" },
  { type: "bicama", label: "Bicama", icon: "🛏️" },
  { type: "beliche", label: "Beliche", icon: "🛏️" },
] as const;

const CATEGORIES = [
  { value: "STANDARD", label: "Standard", description: "Quarto básico confortável" },
  { value: "LUXO", label: "Luxo", description: "Quarto com amenidades premium" },
  { value: "LUXO_SUPERIOR", label: "Luxo Superior", description: "Suíte com máximo conforto" },
];

interface BedType {
  type: "casal" | "solteiro" | "bicama" | "beliche";
  qty: number;
}

export default function NewRoomPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [maxGuests, setMaxGuests] = useState("2");
  const [basePrice, setBasePrice] = useState("");
  const [hasBathroom, setHasBathroom] = useState(true);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [bedTypes, setBedTypes] = useState<BedType[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  // Handle bed type changes
  const addBedType = (type: BedType["type"]) => {
    const existing = bedTypes.find((b) => b.type === type);
    if (existing) {
      setBedTypes(bedTypes.map((b) =>
        b.type === type ? { ...b, qty: b.qty + 1 } : b
      ));
    } else {
      setBedTypes([...bedTypes, { type, qty: 1 }]);
    }
  };

  const removeBedType = (type: BedType["type"]) => {
    const existing = bedTypes.find((b) => b.type === type);
    if (existing && existing.qty > 1) {
      setBedTypes(bedTypes.map((b) =>
        b.type === type ? { ...b, qty: b.qty - 1 } : b
      ));
    } else {
      setBedTypes(bedTypes.filter((b) => b.type !== type));
    }
  };

  // Handle equipment toggle
  const toggleEquipment = (id: string) => {
    if (equipment.includes(id)) {
      setEquipment(equipment.filter((e) => e !== id));
    } else {
      setEquipment([...equipment, id]);
    }
  };

  // Handle photo add
  const addPhoto = () => {
    if (newPhotoUrl && !photos.includes(newPhotoUrl)) {
      setPhotos([...photos, newPhotoUrl]);
      setNewPhotoUrl("");
    }
  };

  const removePhoto = (url: string) => {
    setPhotos(photos.filter((p) => p !== url));
  };

  // Calculate capacity from bed types
  const calculateCapacity = () => {
    let capacity = 0;
    bedTypes.forEach((bed) => {
      switch (bed.type) {
        case "casal":
          capacity += bed.qty * 2;
          break;
        case "solteiro":
          capacity += bed.qty * 1;
          break;
        case "bicama":
          capacity += bed.qty * 2;
          break;
        case "beliche":
          capacity += bed.qty * 2;
          break;
      }
    });
    return capacity;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nome do quarto é obrigatório");
      return;
    }

    if (!category) {
      setError("Selecione uma categoria");
      return;
    }

    if (bedTypes.length === 0) {
      setError("Adicione pelo menos um tipo de cama");
      return;
    }

    if (!basePrice || Number(basePrice) <= 0) {
      setError("Informe o preço base");
      return;
    }

    setSubmitting(true);

    try {
      const result = await createRoom({
        name: name.trim(),
        category: category as "STANDARD" | "LUXO" | "LUXO_SUPERIOR",
        description: description.trim() || null,
        maxGuests: Number(maxGuests) || calculateCapacity(),
        basePrice: parseCurrencyToNumber(basePrice),
        hasBathroom,
        equipment,
        bedTypes,
        photos,
      });

      if (result.success) {
        router.push("/rooms");
      } else {
        setError(result.error || "Erro ao criar quarto");
      }
    } catch (err) {
      setError("Erro inesperado ao criar quarto");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col px-4 md:px-6 space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/rooms">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BedDouble className="h-6 w-6" />
            Cadastrar Novo Quarto
          </h1>
          <p className="text-muted-foreground">
            Preencha todas as informações para criar o anúncio do quarto
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações Básicas</CardTitle>
            <CardDescription>
              Nome, categoria e descrição do quarto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Quarto *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Suíte 01, Apto 02..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div>
                          <span className="font-medium">{cat.label}</span>
                          <span className="text-muted-foreground text-xs ml-2">
                            - {cat.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o quarto, destaque os diferenciais..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/1000 caracteres
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Seção 2: Tipos de Cama */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tipos de Cama *</CardTitle>
            <CardDescription>
              Adicione as camas disponíveis neste quarto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {BED_TYPES.map((bed) => {
                const current = bedTypes.find((b) => b.type === bed.type);
                const qty = current?.qty || 0;
                return (
                  <div
                    key={bed.type}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{bed.icon}</span>
                      <span className="font-medium text-sm">{bed.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeBedType(bed.type)}
                        disabled={qty === 0}
                      >
                        -
                      </Button>
                      <span className="w-6 text-center font-semibold">{qty}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => addBedType(bed.type)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            {bedTypes.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Capacidade estimada:</span>
                <Badge variant="secondary">{calculateCapacity()} hóspedes</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção 3: Capacidade e Banheiro */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Capacidade e Comodidades</CardTitle>
            <CardDescription>
              Defina a capacidade máxima e facilidades do quarto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxGuests">Capacidade Máxima de Hóspedes</Label>
                <Input
                  id="maxGuests"
                  type="number"
                  min="1"
                  max="20"
                  value={maxGuests}
                  onChange={(e) => setMaxGuests(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Sugestão baseada nas camas: {calculateCapacity()}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Banheiro Privativo</Label>
                <div
                  className="flex items-center space-x-2 pt-2 cursor-pointer"
                  onClick={() => setHasBathroom(!hasBathroom)}
                >
                  <div
                    className={`h-4 w-4 rounded border flex items-center justify-center ${
                      hasBathroom
                        ? "bg-primary border-primary"
                        : "border-input"
                    }`}
                  >
                    {hasBathroom && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span className="text-sm">
                    Este quarto possui banheiro privativo
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 4: Equipamentos e Amenidades */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Equipamentos e Amenidades</CardTitle>
            <CardDescription>
              Selecione tudo que está disponível no quarto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {EQUIPMENT_OPTIONS.map((item) => {
                const isChecked = equipment.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      isChecked
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => toggleEquipment(item.id)}
                  >
                    <div
                      className={`h-4 w-4 rounded border flex items-center justify-center ${
                        isChecked
                          ? "bg-primary border-primary"
                          : "border-input"
                      }`}
                    >
                      {isChecked && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                );
              })}
            </div>
            {equipment.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {equipment.map((id) => {
                  const item = EQUIPMENT_OPTIONS.find((e) => e.id === id);
                  return (
                    <Badge key={id} variant="secondary">
                      {item?.icon} {item?.label}
                    </Badge>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção 5: Preço */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preço</CardTitle>
            <CardDescription>
              Defina o preço base da diária
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Preço Base por Diária *</Label>
                <CurrencyInput
                  id="basePrice"
                  value={basePrice}
                  onChange={setBasePrice}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 6: Fotos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Galeria de Fotos</CardTitle>
            <CardDescription>
              Adicione URLs das fotos do quarto (podem ser adicionadas depois)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://exemplo.com/foto.jpg"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addPhoto}
                disabled={!newPhotoUrl}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            {photos.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {photos.map((url, i) => (
                  <div
                    key={i}
                    className="relative group border rounded-lg overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.jpg";
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(url)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {photos.length} foto(s) adicionada(s)
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/rooms">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Criar Quarto
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
