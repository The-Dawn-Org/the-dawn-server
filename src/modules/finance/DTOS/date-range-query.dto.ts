import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty } from "class-validator";

export class DateRangeQueryDto {
  @ApiProperty({ description: "Start date (YYYY-MM-DD)", example: "2026-03-01" })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: "End date (YYYY-MM-DD)", example: "2026-03-07" })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
