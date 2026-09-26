"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowRight, Calendar, Clock, MapPin, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TicketResponse } from "@/types/bookingType";
import { formatDate, formatTime } from "@/lib/utils/format";
import { getCarTypeName, getPassengerTypeName } from "@/lib/utils/ticketUtils";
import { TrainTypeBadge } from "@/components/ticket/TrainTypeBadge";

type BookingHistoryItem = TicketResponse["result"][number];

interface BookingHistoryCardProps {
  booking: BookingHistoryItem;
}

const parseBookingCodeDate = (bookingCode: string) => {
  const rawDate = bookingCode.slice(0, 14);

  if (!/^\d{14}$/.test(rawDate)) {
    return null;
  }

  const year = Number(rawDate.slice(0, 4));
  const month = Number(rawDate.slice(4, 6)) - 1;
  const day = Number(rawDate.slice(6, 8));
  const hour = Number(rawDate.slice(8, 10));
  const minute = Number(rawDate.slice(10, 12));
  const second = Number(rawDate.slice(12, 14));

  const parsedDate = new Date(year, month, day, hour, minute, second);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
};

const formatPaymentDate = (bookingCode: string) => {
  const parsedDate = parseBookingCodeDate(bookingCode);
  if (!parsedDate) return "확인 불가";
  return format(parsedDate, "yyyy년 MM월 dd일(EEEE)", { locale: ko });
};


const getTicketStatusName = (status: string) => {
  switch (status) {
    case "ISSUED":
      return "발권완료";
    case "CANCELLED":
      return "취소";
    case "REFUNDED":
      return "환불";
    default:
      return status;
  }
};

const getTicketStatusColor = (status: string) => {
  switch (status) {
    case "ISSUED":
      return "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300";
    case "CANCELLED":
      return "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300";
    case "REFUNDED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-500/15 dark:text-gray-300";
  }
};

export default function BookingHistoryCard({ booking }: BookingHistoryCardProps) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <TrainTypeBadge trainName={booking.trainName} />
              <Badge variant="outline" className="font-medium">
                열차번호 {booking.trainNumber}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>운행일자: {formatDate(booking.operationDate)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Receipt className="h-4 w-4" />
                <span>결제일자: {formatPaymentDate(booking.bookingCode)}</span>
              </div>
            </div>
          </div>
          {/* 좁은 화면에서는 아래 줄로 내리고, 라벨은 줄바꿈하지 않음(번호만 필요할 때 줄바꿈) */}
          <div className="text-sm sm:text-right">
            <span className="text-muted-foreground mr-1 whitespace-nowrap">예매번호:</span>
            <span className="font-mono break-all">{booking.bookingCode}</span>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-3 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium">{booking.departureStationName}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{booking.arrivalStationName}</span>
            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
            <span>
              {formatTime(booking.departureTime)} ~ {formatTime(booking.arrivalTime)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">승차권 목록</h3>
          {booking.tickets.map((ticket) => (
            <div
              key={ticket.ticketId}
              className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {getCarTypeName(ticket.carType)}
                  </Badge>
                  <Badge className={`${getTicketStatusColor(ticket.status)} text-xs`}>
                    {getTicketStatusName(ticket.status)}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    승차권번호: {ticket.ticketNumber}
                  </span>
                </div>
                <div className="text-sm text-foreground">
                  {ticket.carNumber}호차 {ticket.seatNumber} /{" "}
                  {getPassengerTypeName(ticket.passengerType)}
                </div>
              </div>

              <Button size="sm" variant="outline" className="w-full md:w-auto" asChild>
                <Link href={`/ticket/history/receipt?ticketId=${ticket.ticketId}`}>
                  영수증 상세보기
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
