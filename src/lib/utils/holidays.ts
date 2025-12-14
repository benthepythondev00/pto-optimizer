export interface Holiday {
	date: string; // YYYY-MM-DD format
	name: string;
	type: 'federal' | 'state' | 'observed';
}

export interface CountryHolidays {
	code: string;
	name: string;
	holidays: Holiday[];
}

// Calculate Easter Sunday using the Anonymous Gregorian algorithm
function getEasterSunday(year: number): Date {
	const a = year % 19;
	const b = Math.floor(year / 100);
	const c = year % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const month = Math.floor((h + l - 7 * m + 114) / 31);
	const day = ((h + l - 7 * m + 114) % 31) + 1;
	return new Date(year, month - 1, day);
}

// Get the nth occurrence of a weekday in a month
function getNthWeekday(year: number, month: number, weekday: number, n: number): Date {
	const firstDay = new Date(year, month, 1);
	const firstWeekday = firstDay.getDay();
	let dayOffset = weekday - firstWeekday;
	if (dayOffset < 0) dayOffset += 7;
	const day = 1 + dayOffset + (n - 1) * 7;
	return new Date(year, month, day);
}

// Get last occurrence of a weekday in a month
function getLastWeekday(year: number, month: number, weekday: number): Date {
	const lastDay = new Date(year, month + 1, 0);
	const lastWeekday = lastDay.getDay();
	let dayOffset = lastWeekday - weekday;
	if (dayOffset < 0) dayOffset += 7;
	return new Date(year, month + 1, -dayOffset);
}

function formatDate(date: Date): string {
	// Use local date parts to avoid timezone issues
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

// US Federal Holidays
export function getUSHolidays(year: number): Holiday[] {
	const holidays: Holiday[] = [];

	// New Year's Day - January 1
	holidays.push({
		date: `${year}-01-01`,
		name: "New Year's Day",
		type: 'federal'
	});

	// Martin Luther King Jr. Day - 3rd Monday of January
	const mlkDay = getNthWeekday(year, 0, 1, 3);
	holidays.push({
		date: formatDate(mlkDay),
		name: 'Martin Luther King Jr. Day',
		type: 'federal'
	});

	// Presidents' Day - 3rd Monday of February
	const presidentsDay = getNthWeekday(year, 1, 1, 3);
	holidays.push({
		date: formatDate(presidentsDay),
		name: "Presidents' Day",
		type: 'federal'
	});

	// Memorial Day - Last Monday of May
	const memorialDay = getLastWeekday(year, 4, 1);
	holidays.push({
		date: formatDate(memorialDay),
		name: 'Memorial Day',
		type: 'federal'
	});

	// Juneteenth - June 19
	holidays.push({
		date: `${year}-06-19`,
		name: 'Juneteenth',
		type: 'federal'
	});

	// Independence Day - July 4
	holidays.push({
		date: `${year}-07-04`,
		name: 'Independence Day',
		type: 'federal'
	});

	// Labor Day - 1st Monday of September
	const laborDay = getNthWeekday(year, 8, 1, 1);
	holidays.push({
		date: formatDate(laborDay),
		name: 'Labor Day',
		type: 'federal'
	});

	// Columbus Day - 2nd Monday of October
	const columbusDay = getNthWeekday(year, 9, 1, 2);
	holidays.push({
		date: formatDate(columbusDay),
		name: 'Columbus Day',
		type: 'federal'
	});

	// Veterans Day - November 11
	holidays.push({
		date: `${year}-11-11`,
		name: 'Veterans Day',
		type: 'federal'
	});

	// Thanksgiving - 4th Thursday of November
	const thanksgiving = getNthWeekday(year, 10, 4, 4);
	holidays.push({
		date: formatDate(thanksgiving),
		name: 'Thanksgiving',
		type: 'federal'
	});

	// Christmas Day - December 25
	holidays.push({
		date: `${year}-12-25`,
		name: 'Christmas Day',
		type: 'federal'
	});

	return holidays;
}

// German Holidays (Federal)
export function getGermanHolidays(year: number): Holiday[] {
	const holidays: Holiday[] = [];
	const easter = getEasterSunday(year);

	// New Year's Day
	holidays.push({
		date: `${year}-01-01`,
		name: 'Neujahrstag',
		type: 'federal'
	});

	// Good Friday (Easter - 2 days)
	const goodFriday = new Date(easter);
	goodFriday.setDate(easter.getDate() - 2);
	holidays.push({
		date: formatDate(goodFriday),
		name: 'Karfreitag',
		type: 'federal'
	});

	// Easter Monday (Easter + 1 day)
	const easterMonday = new Date(easter);
	easterMonday.setDate(easter.getDate() + 1);
	holidays.push({
		date: formatDate(easterMonday),
		name: 'Ostermontag',
		type: 'federal'
	});

	// Labour Day - May 1
	holidays.push({
		date: `${year}-05-01`,
		name: 'Tag der Arbeit',
		type: 'federal'
	});

	// Ascension Day (Easter + 39 days)
	const ascension = new Date(easter);
	ascension.setDate(easter.getDate() + 39);
	holidays.push({
		date: formatDate(ascension),
		name: 'Christi Himmelfahrt',
		type: 'federal'
	});

	// Whit Monday (Easter + 50 days)
	const whitMonday = new Date(easter);
	whitMonday.setDate(easter.getDate() + 50);
	holidays.push({
		date: formatDate(whitMonday),
		name: 'Pfingstmontag',
		type: 'federal'
	});

	// German Unity Day - October 3
	holidays.push({
		date: `${year}-10-03`,
		name: 'Tag der Deutschen Einheit',
		type: 'federal'
	});

	// Christmas Day - December 25
	holidays.push({
		date: `${year}-12-25`,
		name: '1. Weihnachtstag',
		type: 'federal'
	});

	// Boxing Day - December 26
	holidays.push({
		date: `${year}-12-26`,
		name: '2. Weihnachtstag',
		type: 'federal'
	});

	return holidays;
}

// UK Bank Holidays
export function getUKHolidays(year: number): Holiday[] {
	const holidays: Holiday[] = [];
	const easter = getEasterSunday(year);

	// New Year's Day
	holidays.push({
		date: `${year}-01-01`,
		name: "New Year's Day",
		type: 'federal'
	});

	// Good Friday
	const goodFriday = new Date(easter);
	goodFriday.setDate(easter.getDate() - 2);
	holidays.push({
		date: formatDate(goodFriday),
		name: 'Good Friday',
		type: 'federal'
	});

	// Easter Monday
	const easterMonday = new Date(easter);
	easterMonday.setDate(easter.getDate() + 1);
	holidays.push({
		date: formatDate(easterMonday),
		name: 'Easter Monday',
		type: 'federal'
	});

	// Early May Bank Holiday - 1st Monday of May
	const earlyMay = getNthWeekday(year, 4, 1, 1);
	holidays.push({
		date: formatDate(earlyMay),
		name: 'Early May Bank Holiday',
		type: 'federal'
	});

	// Spring Bank Holiday - Last Monday of May
	const springBank = getLastWeekday(year, 4, 1);
	holidays.push({
		date: formatDate(springBank),
		name: 'Spring Bank Holiday',
		type: 'federal'
	});

	// Summer Bank Holiday - Last Monday of August
	const summerBank = getLastWeekday(year, 7, 1);
	holidays.push({
		date: formatDate(summerBank),
		name: 'Summer Bank Holiday',
		type: 'federal'
	});

	// Christmas Day
	holidays.push({
		date: `${year}-12-25`,
		name: 'Christmas Day',
		type: 'federal'
	});

	// Boxing Day
	holidays.push({
		date: `${year}-12-26`,
		name: 'Boxing Day',
		type: 'federal'
	});

	return holidays;
}

// Canadian Holidays
export function getCanadianHolidays(year: number): Holiday[] {
	const holidays: Holiday[] = [];
	const easter = getEasterSunday(year);

	// New Year's Day
	holidays.push({
		date: `${year}-01-01`,
		name: "New Year's Day",
		type: 'federal'
	});

	// Good Friday
	const goodFriday = new Date(easter);
	goodFriday.setDate(easter.getDate() - 2);
	holidays.push({
		date: formatDate(goodFriday),
		name: 'Good Friday',
		type: 'federal'
	});

	// Victoria Day - Monday before May 25
	let victoriaDay = new Date(year, 4, 24);
	while (victoriaDay.getDay() !== 1) {
		victoriaDay.setDate(victoriaDay.getDate() - 1);
	}
	holidays.push({
		date: formatDate(victoriaDay),
		name: 'Victoria Day',
		type: 'federal'
	});

	// Canada Day - July 1
	holidays.push({
		date: `${year}-07-01`,
		name: 'Canada Day',
		type: 'federal'
	});

	// Labour Day - 1st Monday of September
	const labourDay = getNthWeekday(year, 8, 1, 1);
	holidays.push({
		date: formatDate(labourDay),
		name: 'Labour Day',
		type: 'federal'
	});

	// National Day for Truth and Reconciliation - September 30
	holidays.push({
		date: `${year}-09-30`,
		name: 'National Day for Truth and Reconciliation',
		type: 'federal'
	});

	// Thanksgiving - 2nd Monday of October
	const thanksgiving = getNthWeekday(year, 9, 1, 2);
	holidays.push({
		date: formatDate(thanksgiving),
		name: 'Thanksgiving',
		type: 'federal'
	});

	// Remembrance Day - November 11
	holidays.push({
		date: `${year}-11-11`,
		name: 'Remembrance Day',
		type: 'federal'
	});

	// Christmas Day
	holidays.push({
		date: `${year}-12-25`,
		name: 'Christmas Day',
		type: 'federal'
	});

	// Boxing Day
	holidays.push({
		date: `${year}-12-26`,
		name: 'Boxing Day',
		type: 'federal'
	});

	return holidays;
}

// Australian Holidays
export function getAustralianHolidays(year: number): Holiday[] {
	const holidays: Holiday[] = [];
	const easter = getEasterSunday(year);

	// New Year's Day
	holidays.push({
		date: `${year}-01-01`,
		name: "New Year's Day",
		type: 'federal'
	});

	// Australia Day - January 26
	holidays.push({
		date: `${year}-01-26`,
		name: 'Australia Day',
		type: 'federal'
	});

	// Good Friday
	const goodFriday = new Date(easter);
	goodFriday.setDate(easter.getDate() - 2);
	holidays.push({
		date: formatDate(goodFriday),
		name: 'Good Friday',
		type: 'federal'
	});

	// Easter Saturday
	const easterSaturday = new Date(easter);
	easterSaturday.setDate(easter.getDate() - 1);
	holidays.push({
		date: formatDate(easterSaturday),
		name: 'Easter Saturday',
		type: 'federal'
	});

	// Easter Monday
	const easterMonday = new Date(easter);
	easterMonday.setDate(easter.getDate() + 1);
	holidays.push({
		date: formatDate(easterMonday),
		name: 'Easter Monday',
		type: 'federal'
	});

	// Anzac Day - April 25
	holidays.push({
		date: `${year}-04-25`,
		name: 'Anzac Day',
		type: 'federal'
	});

	// Queen's Birthday - 2nd Monday of June (most states)
	const queensBirthday = getNthWeekday(year, 5, 1, 2);
	holidays.push({
		date: formatDate(queensBirthday),
		name: "Queen's Birthday",
		type: 'federal'
	});

	// Christmas Day
	holidays.push({
		date: `${year}-12-25`,
		name: 'Christmas Day',
		type: 'federal'
	});

	// Boxing Day
	holidays.push({
		date: `${year}-12-26`,
		name: 'Boxing Day',
		type: 'federal'
	});

	return holidays;
}

// French Holidays
export function getFrenchHolidays(year: number): Holiday[] {
	const holidays: Holiday[] = [];
	const easter = getEasterSunday(year);

	// New Year's Day
	holidays.push({
		date: `${year}-01-01`,
		name: 'Jour de l\'an',
		type: 'federal'
	});

	// Easter Monday
	const easterMonday = new Date(easter);
	easterMonday.setDate(easter.getDate() + 1);
	holidays.push({
		date: formatDate(easterMonday),
		name: 'Lundi de Pâques',
		type: 'federal'
	});

	// Labour Day - May 1
	holidays.push({
		date: `${year}-05-01`,
		name: 'Fête du Travail',
		type: 'federal'
	});

	// Victory in Europe Day - May 8
	holidays.push({
		date: `${year}-05-08`,
		name: 'Victoire 1945',
		type: 'federal'
	});

	// Ascension Day
	const ascension = new Date(easter);
	ascension.setDate(easter.getDate() + 39);
	holidays.push({
		date: formatDate(ascension),
		name: 'Ascension',
		type: 'federal'
	});

	// Whit Monday
	const whitMonday = new Date(easter);
	whitMonday.setDate(easter.getDate() + 50);
	holidays.push({
		date: formatDate(whitMonday),
		name: 'Lundi de Pentecôte',
		type: 'federal'
	});

	// Bastille Day - July 14
	holidays.push({
		date: `${year}-07-14`,
		name: 'Fête Nationale',
		type: 'federal'
	});

	// Assumption of Mary - August 15
	holidays.push({
		date: `${year}-08-15`,
		name: 'Assomption',
		type: 'federal'
	});

	// All Saints' Day - November 1
	holidays.push({
		date: `${year}-11-01`,
		name: 'Toussaint',
		type: 'federal'
	});

	// Armistice Day - November 11
	holidays.push({
		date: `${year}-11-11`,
		name: 'Armistice',
		type: 'federal'
	});

	// Christmas Day
	holidays.push({
		date: `${year}-12-25`,
		name: 'Noël',
		type: 'federal'
	});

	return holidays;
}

// Country configuration
export const COUNTRIES = [
	{ code: 'US', name: 'United States', getHolidays: getUSHolidays },
	{ code: 'DE', name: 'Germany', getHolidays: getGermanHolidays },
	{ code: 'UK', name: 'United Kingdom', getHolidays: getUKHolidays },
	{ code: 'CA', name: 'Canada', getHolidays: getCanadianHolidays },
	{ code: 'AU', name: 'Australia', getHolidays: getAustralianHolidays },
	{ code: 'FR', name: 'France', getHolidays: getFrenchHolidays },
] as const;

export type CountryCode = typeof COUNTRIES[number]['code'];

export function getHolidaysForCountry(countryCode: CountryCode, year: number): Holiday[] {
	const country = COUNTRIES.find(c => c.code === countryCode);
	if (!country) {
		throw new Error(`Unknown country code: ${countryCode}`);
	}
	return country.getHolidays(year);
}
