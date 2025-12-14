import type { Holiday } from './holidays';

export interface OptimizationResult {
	totalDaysOff: number;
	ptoDaysUsed: number;
	efficiency: number; // ratio of days off to PTO used
	periods: VacationPeriod[];
	summary: string;
}

export interface VacationPeriod {
	startDate: string;
	endDate: string;
	totalDays: number;
	ptoDays: number;
	weekendDays: number;
	holidayDays: number;
	holidays: string[];
	efficiency: number;
}

export interface DayInfo {
	date: string;
	dayOfWeek: number; // 0 = Sunday, 6 = Saturday
	isWeekend: boolean;
	isHoliday: boolean;
	holidayName?: string;
	isPto: boolean;
	isBridge: boolean; // A strategic PTO day connecting free days
}

function parseDate(dateStr: string): Date {
	return new Date(dateStr + 'T00:00:00');
}

function formatDate(date: Date): string {
	return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

function getDaysBetween(start: Date, end: Date): number {
	const diffTime = Math.abs(end.getTime() - start.getTime());
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function isWeekend(date: Date): boolean {
	const day = date.getDay();
	return day === 0 || day === 6;
}

// Build a map of all days in the year with their properties
function buildYearMap(year: number, holidays: Holiday[]): Map<string, DayInfo> {
	const dayMap = new Map<string, DayInfo>();
	const holidayMap = new Map<string, string>();
	
	// Build holiday lookup
	for (const holiday of holidays) {
		holidayMap.set(holiday.date, holiday.name);
	}
	
	// Build day info for entire year
	const startDate = new Date(year, 0, 1);
	const endDate = new Date(year, 11, 31);
	
	let currentDate = startDate;
	while (currentDate <= endDate) {
		const dateStr = formatDate(currentDate);
		const dayOfWeek = currentDate.getDay();
		const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
		const holidayName = holidayMap.get(dateStr);
		
		dayMap.set(dateStr, {
			date: dateStr,
			dayOfWeek,
			isWeekend: isWeekendDay,
			isHoliday: !!holidayName,
			holidayName,
			isPto: false,
			isBridge: false,
		});
		
		currentDate = addDays(currentDate, 1);
	}
	
	return dayMap;
}

// Find potential bridge opportunities (gaps between free days)
interface BridgeOpportunity {
	startDate: string;
	endDate: string;
	ptoDaysNeeded: number;
	totalDaysOff: number;
	efficiency: number;
	holidays: string[];
}

function findBridgeOpportunities(
	year: number,
	holidays: Holiday[],
	maxBridgeDays: number = 4
): BridgeOpportunity[] {
	const dayMap = buildYearMap(year, holidays);
	const opportunities: BridgeOpportunity[] = [];
	
	const startDate = new Date(year, 0, 1);
	const endDate = new Date(year, 11, 31);
	
	// Scan through the year looking for clusters of free days
	let currentDate = startDate;
	
	while (currentDate <= endDate) {
		const dateStr = formatDate(currentDate);
		const dayInfo = dayMap.get(dateStr)!;
		
		// If this is a free day (weekend or holiday), explore extending it
		if (dayInfo.isWeekend || dayInfo.isHoliday) {
			const opportunity = exploreBridgeOpportunity(currentDate, dayMap, maxBridgeDays, year);
			if (opportunity && opportunity.efficiency > 1) {
				// Only add if we get more than 1 day off per PTO day
				opportunities.push(opportunity);
			}
		}
		
		currentDate = addDays(currentDate, 1);
	}
	
	// Remove duplicates and overlapping opportunities
	return deduplicateOpportunities(opportunities);
}

function exploreBridgeOpportunity(
	startFrom: Date,
	dayMap: Map<string, DayInfo>,
	maxBridgeDays: number,
	year: number
): BridgeOpportunity | null {
	// Find the start of the free period (going backwards)
	let periodStart = new Date(startFrom);
	while (true) {
		const prevDate = addDays(periodStart, -1);
		if (prevDate.getFullYear() !== year) break;
		const prevInfo = dayMap.get(formatDate(prevDate));
		if (!prevInfo || (!prevInfo.isWeekend && !prevInfo.isHoliday)) break;
		periodStart = prevDate;
	}
	
	// Find the end of the free period (going forwards)
	let periodEnd = new Date(startFrom);
	while (true) {
		const nextDate = addDays(periodEnd, 1);
		if (nextDate.getFullYear() !== year) break;
		const nextInfo = dayMap.get(formatDate(nextDate));
		if (!nextInfo || (!nextInfo.isWeekend && !nextInfo.isHoliday)) break;
		periodEnd = nextDate;
	}
	
	// Now look for nearby free periods to bridge to
	let bestOpportunity: BridgeOpportunity | null = null;
	
	// Look forward for bridge opportunities
	for (let bridgeDays = 1; bridgeDays <= maxBridgeDays; bridgeDays++) {
		const bridgeEnd = addDays(periodEnd, bridgeDays);
		if (bridgeEnd.getFullYear() !== year) break;
		
		const afterBridgeInfo = dayMap.get(formatDate(addDays(bridgeEnd, 1)));
		if (afterBridgeInfo && (afterBridgeInfo.isWeekend || afterBridgeInfo.isHoliday)) {
			// Found a free day after the bridge! Extend to find full period
			let extendedEnd = addDays(bridgeEnd, 1);
			while (true) {
				const nextDate = addDays(extendedEnd, 1);
				if (nextDate.getFullYear() !== year) break;
				const nextInfo = dayMap.get(formatDate(nextDate));
				if (!nextInfo || (!nextInfo.isWeekend && !nextInfo.isHoliday)) break;
				extendedEnd = nextDate;
			}
			
			const totalDays = getDaysBetween(periodStart, extendedEnd);
			const efficiency = totalDays / bridgeDays;
			
			// Collect holidays in this period
			const holidaysInPeriod: string[] = [];
			let checkDate = new Date(periodStart);
			while (checkDate <= extendedEnd) {
				const info = dayMap.get(formatDate(checkDate));
				if (info?.holidayName) {
					holidaysInPeriod.push(info.holidayName);
				}
				checkDate = addDays(checkDate, 1);
			}
			
			if (!bestOpportunity || efficiency > bestOpportunity.efficiency) {
				bestOpportunity = {
					startDate: formatDate(periodStart),
					endDate: formatDate(extendedEnd),
					ptoDaysNeeded: bridgeDays,
					totalDaysOff: totalDays,
					efficiency,
					holidays: holidaysInPeriod,
				};
			}
		}
	}
	
	// Look backward for bridge opportunities
	for (let bridgeDays = 1; bridgeDays <= maxBridgeDays; bridgeDays++) {
		const bridgeStart = addDays(periodStart, -bridgeDays);
		if (bridgeStart.getFullYear() !== year) break;
		
		const beforeBridgeInfo = dayMap.get(formatDate(addDays(bridgeStart, -1)));
		if (beforeBridgeInfo && (beforeBridgeInfo.isWeekend || beforeBridgeInfo.isHoliday)) {
			// Found a free day before the bridge! Extend to find full period
			let extendedStart = addDays(bridgeStart, -1);
			while (true) {
				const prevDate = addDays(extendedStart, -1);
				if (prevDate.getFullYear() !== year) break;
				const prevInfo = dayMap.get(formatDate(prevDate));
				if (!prevInfo || (!prevInfo.isWeekend && !prevInfo.isHoliday)) break;
				extendedStart = prevDate;
			}
			
			const totalDays = getDaysBetween(extendedStart, periodEnd);
			const efficiency = totalDays / bridgeDays;
			
			// Collect holidays in this period
			const holidaysInPeriod: string[] = [];
			let checkDate = new Date(extendedStart);
			while (checkDate <= periodEnd) {
				const info = dayMap.get(formatDate(checkDate));
				if (info?.holidayName) {
					holidaysInPeriod.push(info.holidayName);
				}
				checkDate = addDays(checkDate, 1);
			}
			
			if (!bestOpportunity || efficiency > bestOpportunity.efficiency) {
				bestOpportunity = {
					startDate: formatDate(extendedStart),
					endDate: formatDate(periodEnd),
					ptoDaysNeeded: bridgeDays,
					totalDaysOff: totalDays,
					efficiency,
					holidays: holidaysInPeriod,
				};
			}
		}
	}
	
	return bestOpportunity;
}

function deduplicateOpportunities(opportunities: BridgeOpportunity[]): BridgeOpportunity[] {
	// Sort by efficiency (descending)
	const sorted = [...opportunities].sort((a, b) => b.efficiency - a.efficiency);
	
	const result: BridgeOpportunity[] = [];
	const usedDates = new Set<string>();
	
	for (const opp of sorted) {
		// Check if this opportunity overlaps with already selected ones
		let hasOverlap = false;
		let checkDate = parseDate(opp.startDate);
		const endDate = parseDate(opp.endDate);
		
		while (checkDate <= endDate) {
			if (usedDates.has(formatDate(checkDate))) {
				hasOverlap = true;
				break;
			}
			checkDate = addDays(checkDate, 1);
		}
		
		if (!hasOverlap) {
			result.push(opp);
			// Mark all dates as used
			checkDate = parseDate(opp.startDate);
			while (checkDate <= endDate) {
				usedDates.add(formatDate(checkDate));
				checkDate = addDays(checkDate, 1);
			}
		}
	}
	
	return result;
}

// Main optimization function
export function optimizePTO(
	year: number,
	holidays: Holiday[],
	availablePtoDays: number,
	options: {
		preferLongWeekends?: boolean;
		preferWeekLongVacations?: boolean;
		maxConsecutiveDays?: number;
	} = {}
): OptimizationResult {
	const {
		preferLongWeekends = false,
		preferWeekLongVacations = false,
		maxConsecutiveDays = 14,
	} = options;
	
	// Find all bridge opportunities
	const opportunities = findBridgeOpportunities(year, holidays, 5);
	
	// Sort opportunities based on preferences
	let sortedOpportunities = [...opportunities];
	
	if (preferLongWeekends) {
		// Prefer shorter, more efficient breaks
		sortedOpportunities.sort((a, b) => {
			if (a.ptoDaysNeeded <= 2 && b.ptoDaysNeeded > 2) return -1;
			if (b.ptoDaysNeeded <= 2 && a.ptoDaysNeeded > 2) return 1;
			return b.efficiency - a.efficiency;
		});
	} else if (preferWeekLongVacations) {
		// Prefer longer breaks
		sortedOpportunities.sort((a, b) => {
			if (a.totalDaysOff >= 7 && b.totalDaysOff < 7) return -1;
			if (b.totalDaysOff >= 7 && a.totalDaysOff < 7) return 1;
			return b.efficiency - a.efficiency;
		});
	} else {
		// Default: maximize efficiency
		sortedOpportunities.sort((a, b) => b.efficiency - a.efficiency);
	}
	
	// Select opportunities until we run out of PTO days
	const selectedPeriods: VacationPeriod[] = [];
	let remainingPto = availablePtoDays;
	const dayMap = buildYearMap(year, holidays);
	const usedDates = new Set<string>();
	
	for (const opp of sortedOpportunities) {
		if (remainingPto <= 0) break;
		if (opp.ptoDaysNeeded > remainingPto) continue;
		if (opp.totalDaysOff > maxConsecutiveDays) continue;
		
		// Check for overlap with already selected periods
		let hasOverlap = false;
		let checkDate = parseDate(opp.startDate);
		const endDate = parseDate(opp.endDate);
		
		while (checkDate <= endDate) {
			if (usedDates.has(formatDate(checkDate))) {
				hasOverlap = true;
				break;
			}
			checkDate = addDays(checkDate, 1);
		}
		
		if (hasOverlap) continue;
		
		// Calculate period details
		let weekendDays = 0;
		let holidayDays = 0;
		const holidayNames: string[] = [];
		
		checkDate = parseDate(opp.startDate);
		while (checkDate <= endDate) {
			const info = dayMap.get(formatDate(checkDate));
			if (info) {
				usedDates.add(formatDate(checkDate));
				if (info.isWeekend) weekendDays++;
				if (info.isHoliday) {
					holidayDays++;
					if (info.holidayName) holidayNames.push(info.holidayName);
				}
			}
			checkDate = addDays(checkDate, 1);
		}
		
		selectedPeriods.push({
			startDate: opp.startDate,
			endDate: opp.endDate,
			totalDays: opp.totalDaysOff,
			ptoDays: opp.ptoDaysNeeded,
			weekendDays,
			holidayDays,
			holidays: holidayNames,
			efficiency: opp.efficiency,
		});
		
		remainingPto -= opp.ptoDaysNeeded;
	}
	
	// Sort periods by date
	selectedPeriods.sort((a, b) => a.startDate.localeCompare(b.startDate));
	
	// Calculate totals
	const totalDaysOff = selectedPeriods.reduce((sum, p) => sum + p.totalDays, 0);
	const ptoDaysUsed = availablePtoDays - remainingPto;
	const efficiency = ptoDaysUsed > 0 ? totalDaysOff / ptoDaysUsed : 0;
	
	// Generate summary
	const summary = generateSummary(selectedPeriods, ptoDaysUsed, totalDaysOff, efficiency);
	
	return {
		totalDaysOff,
		ptoDaysUsed,
		efficiency,
		periods: selectedPeriods,
		summary,
	};
}

function generateSummary(
	periods: VacationPeriod[],
	ptoDaysUsed: number,
	totalDaysOff: number,
	efficiency: number
): string {
	if (periods.length === 0) {
		return 'No optimization opportunities found for the given parameters.';
	}
	
	const efficiencyPercent = Math.round((efficiency - 1) * 100);
	const longestPeriod = Math.max(...periods.map(p => p.totalDays));
	
	let summary = `Using ${ptoDaysUsed} PTO days, you can get ${totalDaysOff} days off `;
	summary += `(${efficiencyPercent}% bonus). `;
	summary += `That's ${periods.length} vacation period${periods.length > 1 ? 's' : ''}, `;
	summary += `with the longest being ${longestPeriod} days.`;
	
	return summary;
}

// Get calendar data for visualization
export function getCalendarData(
	year: number,
	holidays: Holiday[],
	optimizationResult: OptimizationResult
): DayInfo[] {
	const dayMap = buildYearMap(year, holidays);
	
	// Mark PTO days
	for (const period of optimizationResult.periods) {
		let currentDate = parseDate(period.startDate);
		const endDate = parseDate(period.endDate);
		
		while (currentDate <= endDate) {
			const dateStr = formatDate(currentDate);
			const dayInfo = dayMap.get(dateStr);
			if (dayInfo && !dayInfo.isWeekend && !dayInfo.isHoliday) {
				dayInfo.isPto = true;
				dayInfo.isBridge = true;
			}
			currentDate = addDays(currentDate, 1);
		}
	}
	
	return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}
