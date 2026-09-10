import { IsArray, IsOptional, IsString } from "class-validator";

export class FilterEventsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  region?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  type?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  launchRegion?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status?: string[];

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
