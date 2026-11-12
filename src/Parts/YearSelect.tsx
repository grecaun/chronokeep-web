import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

interface YearOption {
    value: string
    label: string
}

/**
 * A year picker that sits centered under a page's title and date. Picking a year
 * navigates to the page `linkTo` builds for it. Years are listed newest first.
 */
export default function YearSelect(props: { years: string[], selected: string | undefined, linkTo: (year: string) => string }) {
    const navigate = useNavigate();
    const options: YearOption[] = [...new Set(props.years)]
        .sort((a, b) => Number(b) - Number(a))
        .map(year => ({ value: year, label: year }));
    const value = options.find(option => option.value === props.selected) ?? null;
    return (
        <div className="d-flex justify-content-center mb-2">
            <div style={{ width: '8rem' }}>
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
