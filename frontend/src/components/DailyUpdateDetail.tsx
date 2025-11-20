import { X, FileText, CheckCircle2, Clock, Play } from 'lucide-react';

interface DailyUpdateDetailProps {
  update: {
    _id: string;
    date: string;
    title?: string;
    summary?: string;
    description?: string;
    checklist?: Array<{
      task?: string;
      item?: string;
      completed: boolean;
    }>;
    projectManagement?: Array<{
      item: string;
      completed: boolean;
    }>;
    dailyUpdate?: Array<{
      item: string;
      completed: boolean;
    }>;
    nextPlan?: string;
    loomVideoLink?: string;
    hoursAttended?: number;
  };
  employeeName: string;
  onClose: () => void;
}

export default function DailyUpdateDetail({
  update,
  employeeName,
  onClose,
}: DailyUpdateDetailProps) {
  const getCompletionStats = () => {
    let total = 0;
    let completed = 0;

    if (update.checklist) {
      total += update.checklist.length;
      completed += update.checklist.filter((item) => item.completed).length;
    }

    if (update.projectManagement) {
      total += update.projectManagement.length;
      completed += update.projectManagement.filter((item) => item.completed).length;
    }

    if (update.dailyUpdate) {
      total += update.dailyUpdate.length;
      completed += update.dailyUpdate.filter((item) => item.completed).length;
    }

    return { total, completed, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  const stats = getCompletionStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{employeeName}</h2>
            <p className="text-blue-100 mt-1">
              {new Date(update.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-500 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Completion Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Total Items</p>
              <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-700">{stats.completed}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-purple-600 font-medium">Completion Rate</p>
              <p className="text-3xl font-bold text-purple-700">{stats.percentage.toFixed(0)}%</p>
            </div>
          </div>

          {/* Summary */}
          {(update.summary || update.description) && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Summary
              </h3>
              <p className="text-gray-700">{update.summary || update.description}</p>
            </div>
          )}

          {/* Tasks Section */}
          {update.checklist && update.checklist.length > 0 && (
            <div className="border border-blue-200 rounded-lg overflow-hidden">
              <div className="bg-blue-100 px-4 py-3 border-b border-blue-200">
                <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Tasks ({update.checklist.filter((item) => item.completed).length}/{update.checklist.length})
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {update.checklist.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      disabled
                      className="w-5 h-5 mt-0.5 flex-shrink-0 accent-blue-500 cursor-not-allowed"
                    />
                    <span
                      className={`text-sm flex-1 ${
                        item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {item.task || item.item || ''}
                    </span>
                    {item.completed && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Done
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Management Section */}
          {update.projectManagement && update.projectManagement.length > 0 && (
            <div className="border border-green-200 rounded-lg overflow-hidden">
              <div className="bg-green-100 px-4 py-3 border-b border-green-200">
                <h3 className="font-semibold text-green-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Project Management ({update.projectManagement.filter((item) => item.completed).length}/{update.projectManagement.length})
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {update.projectManagement.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      disabled
                      className="w-5 h-5 mt-0.5 flex-shrink-0 accent-green-500 cursor-not-allowed"
                    />
                    <span
                      className={`text-sm flex-1 ${
                        item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {item.item || ''}
                    </span>
                    {item.completed && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Done
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Update Section */}
          {update.dailyUpdate && update.dailyUpdate.length > 0 && (
            <div className="border border-yellow-200 rounded-lg overflow-hidden">
              <div className="bg-yellow-100 px-4 py-3 border-b border-yellow-200">
                <h3 className="font-semibold text-yellow-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Daily Update ({update.dailyUpdate.filter((item) => item.completed).length}/{update.dailyUpdate.length})
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {update.dailyUpdate.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      disabled
                      className="w-5 h-5 mt-0.5 flex-shrink-0 accent-yellow-500 cursor-not-allowed"
                    />
                    <span
                      className={`text-sm flex-1 ${
                        item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {item.item || ''}
                    </span>
                    {item.completed && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Done
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Plan */}
          {update.nextPlan && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Next Plan
              </h3>
              <p className="text-purple-800">{update.nextPlan}</p>
            </div>
          )}

          {/* Hours Attended */}
          {update.hoursAttended && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border-2 border-indigo-300 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-600 font-medium">Hours Attended</p>
                  <p className="text-4xl font-bold text-indigo-700 mt-1">{update.hoursAttended}h</p>
                </div>
                <div className="bg-indigo-600 p-4 rounded-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Loom Video Link */}
          {update.loomVideoLink && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6 border-2 border-red-300 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-600 p-3 rounded-lg">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-red-900 text-lg">Loom Recording</h3>
                  <p className="text-sm text-red-700">Click to watch the update video</p>
                </div>
              </div>
              <a
                href={update.loomVideoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Play className="w-4 h-4" />
                Watch Video
              </a>
              <div className="mt-4 text-xs text-red-800 bg-red-100 p-3 rounded break-all font-mono">
                {update.loomVideoLink}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
