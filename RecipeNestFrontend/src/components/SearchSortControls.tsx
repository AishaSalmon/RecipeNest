type SortOption = {
    value: string;
    label: string;
};

type SearchSortControlsProps = {
    query: string;
    onQueryChange: (value: string) => void;
    sortValue: string;
    onSortChange: (value: string) => void;
    sortOptions: SortOption[];
    searchPlaceholder?: string;
};


//The search and sort controls component provides a user interface for searching and sorting items.
//It includes an input field for entering a search query and a dropdown for selecting a sort option.
// The component takes in props for the current query, sort value, and functions to handle changes to both the query and sort selection. 
export default function SearchSortControls({
    query,
    onQueryChange,
    sortValue,
    onSortChange,
    sortOptions,
    searchPlaceholder = "Search...",
}: SearchSortControlsProps) {
    return (
        <div style={{ display: "grid", gap: "10px", marginBottom: "16px", width: "100%", resize: "none" }}>
            {/* //the search input field allows users to enter a search query, which is managed by the parent component through the onQueryChange function. */}
            <input
                type="text"
                value={query}
                placeholder={searchPlaceholder}
                onChange={(e) => onQueryChange(e.target.value)}
            />
            {/* //the sort dropdown allows users to select a sorting option from the provided sortOptions, which is manage by the onSortChange function. */}
            <select value={sortValue} onChange={(e) => onSortChange(e.target.value)}>
                {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
