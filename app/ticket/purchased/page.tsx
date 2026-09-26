"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Train, MapPin, ArrowRight, User, Ticket } from "lucide-react";
import { useGetTickets } from "@/hooks/useBooking";
import { differenceInMinutes, parse } from "date-fns";
import { formatDate, formatTime } from "@/lib/utils/format";
import { getCarTypeName } from "@/lib/utils/ticketUtils";
import { TrainTypeBadge } from "@/components/ticket/TrainTypeBadge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { CardListSkeleton } from "@/components/common/CardListSkeleton";
import { PageHeader } from "@/components/common/PageHeader";

interface Ticket {
  bookingId: number;
  bookingCode: string;
  operationDate: string;
  departureStationName: string;
  departureTime: string;
  arrivalStationName: string;
  arrivalTime: string;
  trainNumber: string;
  trainName: string;
  tickets: {
    ticketId: number;
    ticketNumber: string;
    status: string;
    passengerType: string;
    carNumber: number;
    carType: string;
    seatNumber: string;
  }[];
}

function PurchasedTicketsPageContent() {
  const {
    data: tickets = [],
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useGetTickets("UPCOMING");

  // 소요 시간 계산 함수
  const getDuration = (departure: string, arrival: string) => {
    // "HH:mm:ss" 형식
    const dep = parse(departure, "HH:mm:ss", new Date());
    const arr = parse(arrival, "HH:mm:ss", new Date());
    let diff = differenceInMinutes(arr, dep);
    if (diff < 0) diff += 24 * 60; // 자정 넘는 경우
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours > 0 ? hours + "시간 " : ""}${minutes}분`;
  };

  // 로딩 중인 경우
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <PageHeader title="승차권 확인" description="발권한 승차권의 운행·좌석 정보를 확인할 수 있습니다" />
            <CardListSkeleton label="승차권을 불러오는 중" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <PageHeader title="승차권 확인" description="발권한 승차권의 운행·좌석 정보를 확인할 수 있습니다" />

          {/* Content */}
          <div className="w-full">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">승차권</h2>
            </div>

            <div className="space-y-6">
              {isError ? (
                <ErrorState
                  title="승차권을 불러오지 못했습니다"
                  description={error?.message ?? "일시적인 오류로 조회하지 못했습니다. 잠시 후 다시 시도해주세요."}
                  action={<Button onClick={() => refetch()}>다시 시도</Button>}
                />
              ) : tickets.length === 0 ? (
                <EmptyState
                  icon={Ticket}
                  title="발권하신 승차권이 없습니다"
                  description="승차권을 예매하면 여기에서 확인할 수 있어요."
                  action={
                    <Button asChild>
                      <Link href="/">승차권 예매하기</Link>
                    </Button>
                  }
                />
              ) : (
                tickets.map((ticket) => {
                  return (
                    <Card
                      key={ticket.bookingId}
                      className="border-2 border-blue-300 dark:border-blue-500/40 shadow-elev-md"
                    >
                      <CardContent className="p-6">
                        {/* 승차권 헤더 */}
                        <div className="border-b-2 border-blue-200 dark:border-blue-500/30 pb-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                <Train className="h-6 w-6 text-primary-foreground" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <TrainTypeBadge trainName={ticket.trainName} className="text-sm font-bold" />
                                  <span className="text-xl font-bold text-foreground">
                                    {ticket.trainNumber}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {formatDate(ticket.operationDate)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">
                                예매번호: {ticket.bookingCode}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 승차권 본문 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* 운행 정보 */}
                          <div className="bg-card rounded-lg p-4 border border-border">
                            <h3 className="font-bold text-foreground mb-3 flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-primary" />
                              운행 정보
                            </h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="text-center flex-1">
                                  <div className="text-2xl font-bold text-primary">
                                    {formatTime(ticket.departureTime)}
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {ticket.departureStationName}
                                  </div>
                                </div>
                                <div className="flex items-center mx-4">
                                  <div className="w-16 h-0.5 bg-primary-light"></div>
                                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-1" />
                                  <div className="w-16 h-0.5 bg-primary-light"></div>
                                </div>
                                <div className="text-center flex-1">
                                  <div className="text-2xl font-bold text-primary">
                                    {formatTime(ticket.arrivalTime)}
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {ticket.arrivalStationName}
                                  </div>
                                </div>
                              </div>
                              <div className="text-center">
                                <span className="text-sm text-secondary-foreground bg-secondary px-3 py-1 rounded-full">
                                  소요시간{" "}
                                  {getDuration(
                                    ticket.departureTime,
                                    ticket.arrivalTime,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 좌석 정보 */}
                          <div className="bg-card rounded-lg p-4 border border-border">
                            <h3 className="font-bold text-foreground mb-3 flex items-center">
                              <User className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                              좌석 정보
                            </h3>
                            <div className="space-y-2">
                              {(() => {
                                // 호차별로 좌석 그룹화
                                const seatsByCar = ticket.tickets.reduce<
                                  Record<
                                    number,
                                    { carType: string; seats: string[] }
                                  >
                                >((acc, item) => {
                                  if (!acc[item.carNumber]) {
                                    acc[item.carNumber] = {
                                      carType: item.carType,
                                      seats: [],
                                    };
                                  }
                                  acc[item.carNumber].seats.push(
                                    item.seatNumber,
                                  );
                                  return acc;
                                }, {});

                                return Object.entries(seatsByCar).map(
                                  ([carNumber, value]) => (
                                    <div
                                      key={carNumber}
                                      className="flex items-center justify-between p-2 bg-muted rounded"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {getCarTypeName(value.carType)}
                                        </Badge>
                                        <span className="font-medium text-foreground">
                                          {carNumber}호차(
                                          {value.seats.join(", ")})
                                        </span>
                                      </div>
                                    </div>
                                  ),
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* 승차권 하단 정보 */}
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center space-x-4">
                              <span>승차권 발권완료</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PurchasedTicketsPage() {
  return (
    <AuthGuard redirectPath="/ticket/purchased">
      <PurchasedTicketsPageContent />
    </AuthGuard>
  );
}
