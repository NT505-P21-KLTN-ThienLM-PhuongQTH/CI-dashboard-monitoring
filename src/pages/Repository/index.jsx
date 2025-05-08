import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import RepositoryTable from '../../components/DataTable/RepositoryTable';

function Repository() {
  return (
    <>
      <PageMeta
        title="Repository Overview"
        description="Manage your repositories and their settings."
      />
      <PageBreadcrumb
        pageTitle="Repository"
        description="Manage your repositories and their settings."
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6 max-w-full overflow-x-auto">
        <RepositoryTable />
      </div>
    </>
  );
}

export default Repository;