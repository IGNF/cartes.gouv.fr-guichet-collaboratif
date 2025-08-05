export const usePagination = <T>(data: T[], page: number = 1, limit: number) => {
    const totalPage = Math.ceil(data.length / limit);
    const startFrom = (page - 1) * limit;
    const end = page * limit;
    const paginatedData = data.slice(startFrom, end);

    return {
        totalPage,
        paginatedData,
    };
};
export default usePagination;
