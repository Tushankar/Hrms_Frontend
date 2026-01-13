import React from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

const HRFeedback = ({ hrFeedback, formStatus }) => {
  if (!hrFeedback || !hrFeedback.comment) {
    return null;
  }

  // Determine the appropriate icon and color scheme based on form status
  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-400',
          iconColor: 'text-green-400',
          titleColor: 'text-green-800',
          textColor: 'text-green-700',
          dateColor: 'text-green-600'
        };
      case 'rejected':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-400',
          iconColor: 'text-red-400',
          titleColor: 'text-red-800',
          textColor: 'text-red-700',
          dateColor: 'text-red-500'
        };
      case 'under_review':
        return {
          icon: Clock,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-400',
          iconColor: 'text-yellow-400',
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-700',
          dateColor: 'text-yellow-600'
        };
      default:
        return {
          icon: AlertCircle,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-400',
          iconColor: 'text-blue-400',
          titleColor: 'text-blue-800',
          textColor: 'text-blue-700',
          dateColor: 'text-blue-600'
        };
    }
  };

  const config = getStatusConfig(formStatus);
  const IconComponent = config.icon;

  const getStatusTitle = (status) => {
    switch (status) {
      case 'approved':
        return 'Form Approved - HR Notes';
      case 'rejected':
        return 'Form Requires Revision - HR Feedback';
      case 'under_review':
        return 'Form Under Review - HR Notes';
      default:
        return 'HR Review Notes';
    }
  };

  return (
    <div className={`mb-8 ${config.bgColor} border-l-4 ${config.borderColor} rounded-lg shadow-sm`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <IconComponent className={`w-5 h-5 ${config.iconColor} mt-0.5`} />
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
              {getStatusTitle(formStatus)}
            </h3>
            <div className={`text-sm ${config.textColor} mb-2 whitespace-pre-line`}>
              {hrFeedback.comment}
            </div>
            <div className="flex items-center justify-between">
              {hrFeedback.reviewedAt && (
                <p className={`text-xs ${config.dateColor}`}>
                  Reviewed on: {new Date(hrFeedback.reviewedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
              {hrFeedback.reviewedBy && hrFeedback.reviewedBy.userName && (
                <p className={`text-xs ${config.dateColor}`}>
                  Reviewed by: {hrFeedback.reviewedBy.userName}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

HRFeedback.propTypes = {
  hrFeedback: PropTypes.shape({
    comment: PropTypes.string,
    reviewedAt: PropTypes.string,
    reviewedBy: PropTypes.shape({
      userName: PropTypes.string
    })
  }),
  formStatus: PropTypes.oneOf(['draft', 'completed', 'submitted', 'approved', 'rejected', 'under_review'])
};

export default HRFeedback;
