"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import AuthGuard from "@/components/auth/AuthGuard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MapPin,
  Clock,
  ArrowRight,
  X,
  Info,
  CreditCard,
} from "lucide-react";
import { formatPrice, formatDate, formatTime } from "@/lib/utils/format";
import { deletePendingBookings } from "@/lib/api/pendingBookings";
import { usePendingBookingSelection } from "@/hooks/usePendingBookingSelection";
import { useTossPayment } from "@/hooks/useTossPayment";
import { ReservationCard } from "@/components/ticket/reservations/ReservationCard";
import {
  useGetPendingBookingList,
  PENDING_BOOKINGS_QUERY_KEY,
} from "@/hooks/usePendingBooking";
import type { PendingBookingCartItem } from "@/types/bookingType";
import { handleError } from "@/lib/utils/errorHandler";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { TossPaymentWidget } from "@/components/payment/TossPaymentWidget";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrainTypeBadge } from "@/components/ticket/TrainTypeBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { CardListSkeleton } from "@/components/common/CardListSkeleton";
import { PageHeader } from "@/components/common/PageHeader";

function ReservationsPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isChecking } = useAuth({
    redirectPath: "/ticket/reservations",
  });
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedCancelId, setSelectedCancelId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useGetPendingBookingList();
  const reservations = data ?? [];

  const {
    selectedIds,
    validReservations,
    selectedItems,
    totalPrice,
    allSelected,
    toggle,
    toggleAll,
    deselect,
  } = usePendingBookingSelection(reservations);

  const {
    widget,
    paymentInfo,
    paymentLoading,
    showPaymentDialog,
    setShowPaymentDialog,
    prepare,
    requestPayment,
  } = useTossPayment({ enabled: isAuthenticated && !isChecking });

  const handleCancelReservation = (pendingBookingId: string) => {
    setSelectedCancelId(pendingBookingId);
    setShowCancelDialog(true);
  };

  const confirmCancelReservation = async () => {
    if (selectedCancelId) {
      try {
        await deletePendingBookings([selectedCancelId]);
        toast({ description: "예약이 취소되었습니다." });
        deselect(selectedCancelId);
        queryClient.invalidateQueries({ queryKey: PENDING_BOOKINGS_QUERY_KEY });
      } catch (err) {
        toast({
          title: "오류",
          description: handleError(
            err,
            "예약 취소 중 오류가 발생했습니다.",
            false,
          ),
          variant: "destructive",
        });
      }
    }
    setShowCancelDialog(false);
    setSelectedCancelId(null);
  };

  if (isLoading || isError) {
    return (
      <div className="min-h-screen pb-24">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <PageHeader title="예약승차권 조회" description="예약한 승차권을 확인하고 결제하거나 취소할 수 있습니다" />
            {isLoading ? (
              <CardListSkeleton label="예약 목록을 불러오는 중" />
            ) : (
              <ErrorState
                title="예약 목록을 불러올 수 없습니다"
                description={error?.message ?? "일시적인 오류로 조회하지 못했습니다. 잠시 후 다시 시도해주세요."}
                action={
                  <>
                    <Button variant="outline" onClick={() => router.push("/")}>
                      홈으로 돌아가기
                    </Button>
                    <Button onClick={() => refetch()}>다시 시도</Button>
                  </>
                }
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <PageHeader title="예약승차권 조회" description="예약한 승차권을 확인하고 결제하거나 취소할 수 있습니다" />

          {/* Notice — 예약 관련 안내를 목록 위 한 곳에 모은다 */}
          <Alert variant="info" role="note" className="mb-8">
            <Info className="h-4 w-4" />
            <AlertTitle asChild>
              <h2 className="mb-2 font-semibold">결제 전 확인하세요</h2>
            </AlertTitle>
            <AlertDescription>
              <ul className="space-y-1 list-disc list-inside">
                <li>
                  예약 후 10분 이내에 결제하지 않으면 자동으로 취소됩니다.
                </li>
                <li>결제 기한이 지난 예약은 자동으로 삭제됩니다.</li>
                <li>예약 취소는 결제 기한 내에만 가능합니다.</li>
                <li>예약번호는 예약 완료 시 발급된 번호입니다.</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Reservation List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">예약 내역</h2>
              {validReservations.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all-reservations"
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    className="data-[state=checked]:bg-primary"
                  />
                  <label
                    htmlFor="select-all-reservations"
                    className="cursor-pointer text-sm text-muted-foreground"
                  >
                    전체선택 ({selectedItems.length}/{validReservations.length})
                  </label>
                </div>
              )}
            </div>

            {reservations.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="예약 내역이 없습니다"
                description="새로운 예약을 진행하세요."
                action={
                  <Button asChild>
                    <Link href="/">승차권 예매하기</Link>
                  </Button>
                }
              />
            ) : validReservations.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="유효한 예약이 없습니다"
                description="결제 기한이 지난 예약은 자동으로 삭제됩니다."
                action={
                  <Button asChild>
                    <Link href="/">승차권 예매하기</Link>
                  </Button>
                }
              />
            ) : (
              validReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.pendingBookingId}
                  reservation={reservation}
                  selected={selectedIds.has(reservation.pendingBookingId)}
                  onToggle={() => toggle(reservation.pendingBookingId)}
                  onCancel={() => handleCancelReservation(reservation.pendingBookingId)}
                />
              ))
            )}
          </div>

        </div>
      </div>

      {/* Bottom Payment Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-elev-lg p-4 z-50">
          <div className="container mx-auto max-w-4xl flex items-center justify-between">
            <div>
              <span className="font-semibold">
                {selectedItems.length}개 선택
              </span>
              <span className="text-muted-foreground mx-2">·</span>
              <span className="text-lg font-bold text-primary">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <Button
              onClick={() => prepare(selectedItems)}
              disabled={paymentLoading}
            >
              {paymentLoading ? (
                <LoadingSpinner size="sm" color="white" className="mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              결제하기
            </Button>
          </div>
        </div>
      )}

      {/* Toss 결제 Dialog — TossPaymentWidget이 마운트될 때 #payment-widget이 DOM에 존재함 */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>결제 수단 선택</DialogTitle>
            <DialogDescription>
              {selectedItems.length}개 항목 · 총 {formatPrice(totalPrice)}
            </DialogDescription>
          </DialogHeader>
          {showPaymentDialog && widget && paymentInfo && (
            <TossPaymentWidget
              paymentWidget={widget}
              paymentInfo={paymentInfo}
              onCancel={() => setShowPaymentDialog(false)}
              onRequestPayment={() => requestPayment(selectedItems)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Reservation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약 취소</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 예약을 취소하시겠습니까?
              <br />
              취소된 예약은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelReservation}
              className={buttonVariants({ variant: "destructive" })}
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ReservationsPage() {
  return (
    <AuthGuard redirectPath="/ticket/reservations">
      <ReservationsPageContent />
    </AuthGuard>
  );
}
