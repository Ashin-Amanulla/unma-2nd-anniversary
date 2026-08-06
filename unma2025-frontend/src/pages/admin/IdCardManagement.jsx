import { useState } from "react";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  IdentificationIcon,
  UserGroupIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import {
  useIdCardStats,
  useDownloadableIdCards,
  useIdCardPreview,
  useDownloadIdCard,
  useBulkDownloadIdCards,
  useGeneratePaidIdCards,
} from "../../hooks/useIdCard";

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
          {value ?? 0}
        </p>
      </div>
      <div className="rounded-md bg-teal-50 p-2 text-teal-700">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const PreviewModal = ({ registrationId, name, onClose }) => {
  const { data, isLoading, isError } = useIdCardPreview(registrationId, {
    enabled: !!registrationId,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">
            ID Card Preview — {name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-800"
          >
            Close
          </button>
        </div>
        <div className="flex min-h-[280px] items-center justify-center p-4">
          {isLoading && (
            <p className="text-sm text-gray-500">Generating preview…</p>
          )}
          {isError && (
            <p className="text-sm text-red-600">Failed to load preview.</p>
          )}
          {data?.data?.image && (
            <img
              src={data.data.image}
              alt={`ID card for ${name}`}
              className="max-h-[420px] w-full rounded-md border border-gray-200 object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const IdCardManagement = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [previewTarget, setPreviewTarget] = useState(null);
  const limit = 20;

  const { data: statsData, isLoading: statsLoading } = useIdCardStats();
  const { data: listData, isLoading: listLoading, refetch } =
    useDownloadableIdCards({ page, limit, search: search || undefined });

  const downloadMutation = useDownloadIdCard();
  const bulkDownloadMutation = useBulkDownloadIdCards();
  const generateMutation = useGeneratePaidIdCards();

  const stats = statsData?.data;
  const cards = listData?.data?.cards || [];
  const pagination = listData?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalCards: 0,
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">ID Cards</h1>
          <p className="text-xs text-gray-500">
            Preview, download, and bulk-export attendee badges for paid
            registrations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => generateMutation.mutate(20, { onSuccess: () => refetch() })}
            disabled={generateMutation.isPending}
            className="inline-flex h-8 items-center rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Generate for paid
          </button>
          <button
            type="button"
            onClick={() => bulkDownloadMutation.mutate({ downloadAll: true })}
            disabled={bulkDownloadMutation.isPending}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-teal-700 px-3 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Download all ZIP
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Paid & attending"
          value={stats?.registrations?.paidAndAttending}
          icon={UserGroupIcon}
        />
        <StatCard
          label="ID cards generated"
          value={stats?.idCards?.total}
          icon={IdentificationIcon}
        />
        <StatCard
          label="Downloaded"
          value={stats?.downloads?.downloaded}
          icon={DocumentArrowDownIcon}
        />
        <StatCard
          label="Pending generation"
          value={stats?.idCards?.pending}
          icon={IdentificationIcon}
        />
      </div>

      {(statsLoading || listLoading) && (
        <p className="text-xs text-gray-500">Loading ID card data…</p>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={handleSearch}
              placeholder="Search name, email, or phone"
              className="h-8 w-full rounded-md border border-gray-200 bg-white pl-8 pr-3 text-sm placeholder:text-gray-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/25"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Serial
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Payment
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cards.length === 0 && !listLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-sm text-gray-500"
                  >
                    No downloadable ID cards yet. Run the demo seeder or mark
                    registrations as paid and attending.
                  </td>
                </tr>
              )}
              {cards.map((card) => (
                <tr key={card.registrationId} className="hover:bg-gray-50/60">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{card.name}</div>
                    <div className="text-xs text-gray-500">{card.email}</div>
                  </td>
                  <td className="px-3 py-2 tabular-nums text-gray-700">
                    {card.serialNumber ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span className="rounded px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-emerald-600/20 bg-emerald-50 text-emerald-700">
                      {card.paymentStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600">
                    {card.idCard?.generationStatus || "pending"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewTarget({
                            registrationId: card.registrationId,
                            name: card.name,
                          })
                        }
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-gray-200 px-2 text-xs text-gray-600 hover:bg-gray-50"
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          downloadMutation.mutate({
                            registrationId: card.registrationId,
                            format: "png",
                            name: card.name,
                          })
                        }
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-gray-200 px-2 text-xs text-gray-600 hover:bg-gray-50"
                      >
                        PNG
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          downloadMutation.mutate({
                            registrationId: card.registrationId,
                            format: "pdf",
                            name: card.name,
                          })
                        }
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-gray-200 px-2 text-xs text-gray-600 hover:bg-gray-50"
                      >
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-xs text-gray-600">
            <span>
              Page {pagination.currentPage} of {pagination.totalPages} (
              {pagination.totalCards} total)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-gray-200 px-2 py-1 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-gray-200 px-2 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {previewTarget && (
        <PreviewModal
          registrationId={previewTarget.registrationId}
          name={previewTarget.name}
          onClose={() => setPreviewTarget(null)}
        />
      )}
    </div>
  );
};

export default IdCardManagement;
