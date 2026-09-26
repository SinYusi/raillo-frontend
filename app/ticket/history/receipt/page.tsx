"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowRight, Receipt } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { TicketReceiptResponse } from "@/types/bookingType";
import { useGetTicketReceipt } from "@/hooks/useBooking";
import { formatDate, formatTime, formatPrice } from "@/lib/utils/format";
import {
  getCarTypeName,
  getPassengerTypeName,
  getPaymentMethodName,
} from "@/lib/utils/ticketUtils";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ErrorState } from "@/components/common/ErrorState";
import { CardListSkeleton } from "@/components/common/CardListSkeleton";
import { PageHeader } from "@/components/common/PageHeader";

type TicketReceiptDetail = TicketReceiptResponse["result"];

export default function TicketReceiptDetailPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated, isChecking } = useAuth({
    redirectPath: "/ticket/history",
  });

  const ticketId = useMemo(() => {
    const raw = searchParams.get("ticketId");
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);

  const {
    data: receipt = null,
    isLoading: loading,
    isError,
    error,
  } = useGetTicketReceipt(ticketId);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return format(date, "yyyy년 MM월 dd일 HH:mm:ss", { locale: ko });
  };

  if (isChecking || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <LoadingSpinner className="mx-auto mb-4" />
        <p className="text-muted-foreground">인증을 확인하고 있습니다...</p>
      </div>
    );
  }

  if (loading || isError || !receipt) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <PageHeader title="영수증 상세" description="승차권 영수증 정보를 확인할 수 있습니다" className="mb-0" />
            {loading ? (
              <CardListSkeleton label="영수증 상세를 불러오는 중" count={2} />
            ) : (
              <ErrorState
                title="영수증 정보를 불러올 수 없습니다"
                description={error?.message ?? "데이터가 없습니다."}
                action={
                  <Button variant="outline" asChild>
                    <Link href="/ticket/history">내역으로 돌아가기</Link>
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader title="영수증 상세" description="승차권 영수증 정보를 확인할 수 있습니다" className="mb-0" />

          <Card>
            <CardHeader>
              <CardTitle asChild className="flex items-center gap-2">
                <h2>
                  <Receipt className="h-5 w-5 text-primary" />
                  <span>승차권 정보</span>
                </h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">승차권 번호</span>
                <span className="font-mono font-medium">
                  {receipt.ticketNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">열차</span>
                <Badge variant="outline">{receipt.trainNumber}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">좌석</span>
                <span className="font-medium">
                  {receipt.carNumber}호차 {receipt.seatNumber} (
                  {getCarTypeName(receipt.carType)})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">승객</span>
                <span className="font-medium">
                  {getPassengerTypeName(receipt.passengerType)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle asChild className="flex items-center gap-2">
                <h2>
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>운행 정보</span>
                </h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">운행일</span>
                <span className="font-medium">
                  {formatDate(receipt.operationDate)}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 p-3 bg-muted rounded-lg">
                <span className="font-semibold">
                  {receipt.departureStationName}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">
                  {receipt.arrivalStationName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">출발/도착</span>
                <span className="font-medium">
                  {formatTime(receipt.departureTime)} ~{" "}
                  {formatTime(receipt.arrivalTime)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle asChild className="flex items-center gap-2">
                <h2>
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>결제 정보</span>
                </h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">결제수단</span>
                <span className="font-medium">
                  {getPaymentMethodName(receipt.paymentMethod)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">결제금액</span>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(receipt.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">결제일시</span>
                <span className="font-medium">
                  {formatDateTime(receipt.paidAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">발권일시</span>
                <span className="font-medium">
                  {formatDateTime(receipt.ticketCreatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button variant="outline" className="px-8" asChild>
              <Link href="/ticket/history">
                내역으로 돌아가기
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
