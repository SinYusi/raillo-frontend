"use client";

import { ArrowRight, Clock, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { TrainTypeBadge } from "@/components/ticket/TrainTypeBadge";
import {
  formatDate,
  formatDateTime,
  formatPrice,
  formatTime,
} from "@/lib/utils/format";
import type { PendingBookingCartItem } from "@/types/bookingType";

interface ReservationCardProps {
  reservation: PendingBookingCartItem;
  selected: boolean;
  onToggle: () => void;
  onCancel: () => void;
}

const totalFareOf = (reservation: PendingBookingCartItem): number =>
  reservation.totalFare ?? reservation.fare ?? 0;

const seatSummaryOf = (seats: PendingBookingCartItem["seats"]): string => {
  const seatType = seats[0]?.carType === "FIRST_CLASS" ? "특실" : "일반실";
  return `${seatType} ${seats.length}매`;
};

/** 예약 한 건 — 선택·취소는 이벤트로 넘긴다 */
export function ReservationCard({
  reservation,
  selected,
  onToggle,
  onCancel,
}: ReservationCardProps) {
  return (
    <Card
      className={`shadow-elev-sm transition-all duration-200 hover:shadow-elev-md ${selected ? "border-primary ring-[3px] ring-secondary" : ""}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            aria-label={`${reservation.trainName} ${reservation.trainNumber} ${formatDate(reservation.operationDate)} ${reservation.departureStationName} 출발 ${reservation.arrivalStationName} 도착 예약 선택`}
            className="mt-1 data-[state=checked]:bg-primary"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <TrainTypeBadge trainName={reservation.trainName} />
                <span className="text-lg font-bold">
                  {reservation.trainNumber}
                </span>
                <span className="text-muted-foreground">
                  {formatDate(reservation.operationDate)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">
                  {formatPrice(totalFareOf(reservation))}
                </div>
                <div className="text-xs text-muted-foreground">
                  예약번호: {reservation.pendingBookingId}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <h3 className="font-medium text-foreground mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  운행 정보
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {reservation.departureStationName}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">
                      {reservation.arrivalStationName}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTime(reservation.departureTime)} ~{" "}
                    {formatTime(reservation.arrivalTime)}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-2">
                  좌석 정보
                </h3>
                <div className="text-sm font-medium">
                  {seatSummaryOf(reservation.seats)}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  결제 기한
                </h3>
                <div className="text-sm font-medium">
                  {reservation.expiresAt
                    ? `${formatDateTime(reservation.expiresAt)}까지`
                    : "기한 정보 없음"}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="outline-destructive"
                size="sm"
                onClick={onCancel}
              >
                <X className="h-4 w-4 mr-1" />
                예약취소
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
