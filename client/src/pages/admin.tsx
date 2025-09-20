import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, User, DollarSign, Trophy, ShoppingCart, Zap } from "lucide-react";
import type { User as UserType } from "@shared/schema";

export function AdminPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editType, setEditType] = useState<"points" | "balance">("points");
  const [editValue, setEditValue] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se o usuário está autenticado como admin
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('adminAuth');
    if (!adminAuth || adminAuth !== 'true') {
      // Redirecionar para login de admin
      setLocation('/adm/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [setLocation]);

  // Buscar todos os usuários
  const { data: usersData, isLoading } = useQuery<{ users: UserType[] }>({
    queryKey: ["/api/admin/users"],
    refetchInterval: 10000, // Atualizar a cada 10 segundos
  });

  const users = usersData?.users || [];

  // Mutation para atualizar pontos
  const updatePointsMutation = useMutation({
    mutationFn: async ({ userId, points }: { userId: string; points: number }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/points`, { points });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Pontos atualizados",
        description: "Os pontos do usuário foram atualizados com sucesso.",
      });
      setEditModalOpen(false);
      setEditValue("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar pontos do usuário.",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar saldo
  const updateBalanceMutation = useMutation({
    mutationFn: async ({ userId, balance }: { userId: string; balance: number }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/balance`, { balance });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Saldo atualizado",
        description: "O saldo do usuário foi atualizado com sucesso.",
      });
      setEditModalOpen(false);
      setEditValue("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar saldo do usuário.",
        variant: "destructive",
      });
    },
  });

  const openEditModal = (user: UserType, type: "points" | "balance") => {
    setSelectedUser(user);
    setEditType(type);
    setEditValue(type === "points" ? user.points.toString() : user.balance);
    setEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    if (!selectedUser) return;

    const value = parseFloat(editValue);
    if (isNaN(value) || value < 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor numérico válido.",
        variant: "destructive",
      });
      return;
    }

    if (editType === "points") {
      updatePointsMutation.mutate({ userId: selectedUser.id, points: Math.floor(value) });
    } else {
      updateBalanceMutation.mutate({ userId: selectedUser.id, balance: value });
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins} min`;
  };

  const hasPurchased = (user: UserType) => {
    // Considera que teve compra se o total de ganhos é maior que 0
    return parseFloat(user.totalEarnings) > 0;
  };

  // Aguardar verificação de autorização
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-10 text-center">
              <div className="text-lg text-muted-foreground">
                Redirecionando para login...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-10 text-center">
              <div className="text-lg text-muted-foreground">Carregando dados dos usuários...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <User className="h-7 w-7 text-purple-600" />
              Painel Administrativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total de Usuários</p>
                <p className="text-2xl font-bold text-blue-900">{users.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Usuários Premium</p>
                <p className="text-2xl font-bold text-purple-900">
                  {users.filter((u: UserType) => u.isPremium).length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Com Compras</p>
                <p className="text-2xl font-bold text-green-900">
                  {users.filter(hasPurchased).length}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Ativos Hoje</p>
                <p className="text-2xl font-bold text-orange-900">
                  {users.filter((u: UserType) => {
                    const lastLogin = u.lastLoginDate ? new Date(u.lastLoginDate) : null;
                    const today = new Date();
                    return lastLogin && 
                           lastLogin.getDate() === today.getDate() &&
                           lastLogin.getMonth() === today.getMonth() &&
                           lastLogin.getFullYear() === today.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Cadastrados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="text-center">Plano</TableHead>
                    <TableHead className="text-center">Compras</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Tempo Ativo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: UserType) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          {user.fullName && (
                            <p className="text-sm text-muted-foreground">{user.fullName}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{user.email}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(user.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {user.isPremium ? (
                          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                            <Zap className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Gratuito</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {hasPurchased(user) ? (
                          <Badge variant="default" className="bg-green-600">
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Sim
                          </Badge>
                        ) : (
                          <Badge variant="outline">Não</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">{user.points.toLocaleString("pt-BR")}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold">
                            R$ {parseFloat(user.balance).toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{formatTime(user.totalListeningTime)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(user, "points")}
                            data-testid={`button-edit-points-${user.id}`}
                          >
                            Editar Pontos
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(user, "balance")}
                            data-testid={`button-edit-balance-${user.id}`}
                          >
                            Editar Saldo
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                        Nenhum usuário cadastrado ainda
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Editar {editType === "points" ? "Pontos" : "Saldo"} do Usuário
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-semibold">{selectedUser.username}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
              
              <div>
                <Label htmlFor="edit-value">
                  {editType === "points" ? "Pontos" : "Saldo (R$)"}
                </Label>
                <Input
                  id="edit-value"
                  type="number"
                  step={editType === "balance" ? "0.01" : "1"}
                  min="0"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={editType === "points" ? "Digite os pontos" : "Digite o saldo"}
                  data-testid={`input-edit-${editType}`}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Valor atual: {editType === "points" 
                    ? selectedUser.points.toLocaleString("pt-BR") + " pontos"
                    : "R$ " + parseFloat(selectedUser.balance).toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEditSubmit}
              disabled={updatePointsMutation.isPending || updateBalanceMutation.isPending}
              data-testid="button-confirm-edit"
            >
              {updatePointsMutation.isPending || updateBalanceMutation.isPending 
                ? "Salvando..." 
                : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}