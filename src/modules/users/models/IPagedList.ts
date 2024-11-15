export default interface IPagedList<T> {
    totalPages: number;
    currentPage: number;
    totalResults: number;
    pageResults: number;
    data: T[];
}