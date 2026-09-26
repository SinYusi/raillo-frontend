"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt } from "lucide-react";
import type { TicketResponse } from "@/types/bookingType";
import { useGetTickets } from "@/hooks/useBooking";
import BookingHistoryCard from "@/components/ticket/history/BookingHistoryCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { CardListSkeleton } from "@/components/common/CardListSkeleton";
import { PageHeader } from "@/components/common/PageHeader";

type BookingHistoryItem = TicketResponse["result"][number];
type HistoryTab = "all" | "issued" | "cancelled";

export default function PaymentHistoryPage() {
  const { isAuthenticated, isChecking } = useAuth({
    redirectPath: "/ticket/history",
  });
  const {
    data: bookings = [],
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useGetTickets();
  const [activeTab, setActiveTab] = useState<HistoryTab>("all");

  const isIssuedBooking = (booking: BookingHistoryItem) =>
    booking.tickets.length > 0 &&
    booking.tickets.every((ticket) => ticket.status === "ISSUED");

  const isCancelledBooking = (booking: BookingHistoryItem) =>
    booking.tickets.some(
      (ticket) => ticket.status === "CANCELLED" || ticket.status === "REFUNDED",
    );

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (activeTab === "issued") {
        return isIssuedBooking(booking);
      }
      if (activeTab === "cancelled") {
        return isCancelledBooking(booking);
      }
      return true;
    });
  }, [activeTab, bookings]);

  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 container mx-auto px-4 py-16 text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-muted-foreground">인증을 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
          <PageHeader title="예매 내역" description="예매번호와 영수증 상세를 확인할 수 있습니다" />
            <CardListSkeleton label="예매 내역을 불러오는 중" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <PageHeader title="예매 내역" description="예매번호와 영수증 상세를 확인할 수 있습니다" />

          <div className="mb-6">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as HistoryTab)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  전체
                </TabsTrigger>
                <TabsTrigger value="issued">
                  발권완료
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  취소/환불
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-6">
            {isError ? (
              <ErrorState
                title="예매 내역을 불러오지 못했습니다"
                description={error?.message ?? "일시적인 오류로 조회하지 못했습니다. 잠시 후 다시 시도해주세요."}
                action={<Button onClick={() => refetch()}>다시 시도</Button>}
              />
            ) : filteredBookings.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title={
                  { all: "예매 내역이 없습니다", issued: "발권 완료된 내역이 없습니다", cancelled: "취소/환불 내역이 없습니다" }[activeTab]
                }
                description="승차권을 예매하시면 내역이 여기에 표시됩니다."
                action={
                  <Button asChild>
                    <Link href="/ticket/search">승차권 예매하기</Link>
                  </Button>
                }
              />
            ) : (
              filteredBookings.map((booking) => (
                <BookingHistoryCard key={booking.bookingId} booking={booking} />
              ))
            )}
          </div>

          {filteredBookings.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                총 {filteredBookings.length}건의 예매 내역
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
