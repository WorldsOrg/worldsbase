const NoSearchResult = ({ text }: { text: string }) => {
    return (
        <div className="flex flex-col gap-1 p-3 text-xs rounded-md bg-softBg text-primary">
            <div className="font-bold">No results found</div>
            <div>
                Your search for <span>{`"${text}"`}</span> did not return any results
            </div>
        </div>
    );
};

export default NoSearchResult;
