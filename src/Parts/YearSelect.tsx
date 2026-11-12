import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

interface YearOption {
    value: string
    label: string
}

/**
 * A year picker that sits centered under a page's title and date. Picking a year
 * navigates to the page `linkTo` builds for it. Years are listed in the order
 * given, so pass them newest first. Year names aren't always numbers (some events
 * use names like "2025-October"), so the box widens to fit the longest one.
 */
export default function YearSelect(props: { years: string[], selected: string | undefined, linkTo: (year: string) => string }) {
    const navigate = useNavigate();
    const options: YearOption[] = [...new Set(props.years)].map(year => ({ value: year, label: year }));
    const longest = Math.max(0, ...options.map(option => option.label.length));
    const value = options.find(option => option.value === props.selected) ?? null;
    return (
        <div className="d-flex justify-content-center mb-2">
            <div style={{ width: `calc(${longest}ch + 5rem)`, minWidth: '8rem', maxWidth: '100%' }}>
                <Select
                    aria-label="Year"
                    inputId="year-select"
                    options={options}
                    value={value}
                    isSearchable={false}
                    onChange={(option: YearOption | null) => {
                        if (option !== null && option.value !== props.selected) {
                            void navigate(props.linkTo(option.value));
                        }
                    }}
                    />
            </div>
        </div>
    );
}
