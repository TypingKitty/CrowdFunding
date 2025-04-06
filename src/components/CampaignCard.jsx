import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CampaignCard = ({ campaign }) => {
  const [imageError, setImageError] = useState(false);

  const placeholderImage = 'https://placehold.co/600x400/e5e7eb/1f2937?text=Campaign+Image';

  return (
    <Link to={`/campaign/${campaign.id}`} state={{ campaign }} className="text-inherit no-underline">
      <Card className="w-full max-w-sm flex flex-col h-[500px] overflow-hidden transition-shadow hover:shadow-xl rounded-2xl">
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <img
            src={imageError ? placeholderImage : campaign.bannerImageURL}
            alt={campaign.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <CardContent className="flex flex-col justify-between flex-1 p-4">
          <div className="space-y-2">
            <Badge
              variant="outline"
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                campaign.state === 'Open'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {campaign.state}
            </Badge>
            <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">{campaign.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
              {campaign.description}
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                style={{ width: `${(Number(campaign.currentFundsRaised) / Number(campaign.goal)) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Raised: {Number(campaign.currentFundsRaised)} Wei</span>
              <span>Goal: {Number(campaign.goal)} Wei</span>
            </div>
            <p className="text-xs text-gray-500">End Date: {new Date(Number(campaign.durationInDays) * 1000).toLocaleDateString()}</p>
          </div>
        </CardContent>
    
      </Card>
    </Link>
  );
};

export default CampaignCard;
