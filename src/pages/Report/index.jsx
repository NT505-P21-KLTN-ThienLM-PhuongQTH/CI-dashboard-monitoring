import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ReportTable from '../../components/DataTable/ReportTable';

function Report() {
    return (
        <>
            <PageMeta
                title="Report Overview"
                description="Review and handle user-reported issues related to model prediction mismatches."
            />
            <PageBreadcrumb
                pageTitle="Report"
                description="Review and handle user-reported issues related to model prediction mismatches."
            />
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6 max-w-full overflow-x-auto">
                <ReportTable />
            </div>
        </>
    );
}

export default Report;