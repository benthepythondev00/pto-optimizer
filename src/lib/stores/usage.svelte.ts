// Usage tracking store for freemium limits
// Persists to localStorage, resets monthly

const FREE_MONTHLY_LIMIT = 3;
const STORAGE_KEY = 'pto-optimizer-usage';

interface UsageData {
	count: number;
	month: number; // 0-11
	year: number;
	isPro: boolean;
}

function getInitialUsage(): UsageData {
	if (typeof window === 'undefined') {
		return { count: 0, month: new Date().getMonth(), year: new Date().getFullYear(), isPro: false };
	}
	
	const stored = localStorage.getItem(STORAGE_KEY);
	if (!stored) {
		return { count: 0, month: new Date().getMonth(), year: new Date().getFullYear(), isPro: false };
	}
	
	try {
		const data = JSON.parse(stored) as UsageData;
		const now = new Date();
		
		// Reset if new month
		if (data.month !== now.getMonth() || data.year !== now.getFullYear()) {
			return { count: 0, month: now.getMonth(), year: now.getFullYear(), isPro: data.isPro };
		}
		
		return data;
	} catch {
		return { count: 0, month: new Date().getMonth(), year: new Date().getFullYear(), isPro: false };
	}
}

function createUsageStore() {
	let usage = $state<UsageData>(getInitialUsage());
	
	const remaining = $derived(FREE_MONTHLY_LIMIT - usage.count);
	const canOptimize = $derived(usage.isPro || usage.count < FREE_MONTHLY_LIMIT);
	const isAtLimit = $derived(!usage.isPro && usage.count >= FREE_MONTHLY_LIMIT);
	const usagePercentage = $derived(Math.min((usage.count / FREE_MONTHLY_LIMIT) * 100, 100));
	
	function save() {
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
		}
	}
	
	function incrementUsage() {
		usage.count++;
		save();
	}
	
	function setPro(isPro: boolean) {
		usage.isPro = isPro;
		save();
	}
	
	function reset() {
		usage.count = 0;
		save();
	}
	
	// Initialize from localStorage on mount
	function init() {
		usage = getInitialUsage();
	}
	
	return {
		get count() { return usage.count; },
		get isPro() { return usage.isPro; },
		get remaining() { return remaining; },
		get canOptimize() { return canOptimize; },
		get isAtLimit() { return isAtLimit; },
		get usagePercentage() { return usagePercentage; },
		get limit() { return FREE_MONTHLY_LIMIT; },
		incrementUsage,
		setPro,
		reset,
		init
	};
}

export const usageStore = createUsageStore();
