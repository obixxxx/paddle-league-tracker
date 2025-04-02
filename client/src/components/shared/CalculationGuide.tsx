import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Trophy, 
  Info, 
  Calculator, 
  Gauge, 
  TrendingUp, 
  HeartHandshake 
} from 'lucide-react';

const CalculationGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Calculator className="mr-2 h-5 w-5 text-purple-600" />
          How Ratings are Calculated
        </CardTitle>
        <CardDescription>
          Understanding how ELO ratings and chemistry scores work
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="elo">
            <AccordionTrigger className="font-medium">
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-emerald-600" />
                ELO Rating System
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-gray-600 space-y-3">
              <p>
                ELO is a rating system that measures relative skill levels between players. 
                All players start at 1500 ELO points.
              </p>

              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h4 className="font-semibold">How ELO points change after matches:</h4>
                <ul className="list-disc pl-5 space-y-1 mt-1 text-xs">
                  <li>Your expected win probability is calculated based on ELO difference</li>
                  <li>Winning against higher-rated players gives you more points</li>
                  <li>The margin of victory also factors in (bigger wins = more points)</li>
                  <li>A typical win awards 10-20 ELO points</li>
                  <li>Players on the same team receive the same ELO changes</li>
                </ul>
              </div>

              <p className="text-xs italic">
                Technical note: The formula uses K-factor of 20 and includes a multiplier 
                based on point differential, capped at 1.5x for very large wins.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="chemistry">
            <AccordionTrigger className="font-medium">
              <div className="flex items-center">
                <HeartHandshake className="mr-2 h-4 w-4 text-pink-600" />
                Chemistry Rating
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-gray-600 space-y-3">
              <p>
                Chemistry rating measures how well two players perform together as partners
                and whether they exceed or fall short of expectations.
              </p>

              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h4 className="font-semibold">How Chemistry is calculated:</h4>
                <ul className="list-disc pl-5 space-y-1 mt-1 text-xs">
                  <li>Starts at a baseline of 100 (neutral chemistry)</li>
                  <li>Adjusted based on how the partnership performs relative to expected results</li>
                  <li>Win percentage above 50% improves chemistry</li>
                  <li>Positive point differential also boosts chemistry</li>
                  <li>Accounts for sample size - more consistent results with more games</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div className="bg-red-50 p-2 rounded">
                  <p className="font-semibold text-red-700">Below 100</p>
                  <p>Players underperform when paired together</p>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <p className="font-semibold text-green-700">Above 100</p>
                  <p>Players exceed expectations as partners</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="powerranking">
            <AccordionTrigger className="font-medium">
              <div className="flex items-center">
                <Gauge className="mr-2 h-4 w-4 text-blue-600" />
                Power Ranking
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-gray-600 space-y-3">
              <p>
                Power ranking is a composite score that combines multiple performance
                metrics to give an overall indication of a player's current form.
              </p>

              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h4 className="font-semibold">What factors into Power Ranking:</h4>
                <ul className="list-disc pl-5 space-y-1 mt-1 text-xs">
                  <li>ELO rating (weighted at 30%)</li>
                  <li>Point differential (heavily weighted)</li>
                  <li>Win percentage (lightly weighted)</li>
                </ul>
              </div>

              <p>
                This provides a more holistic view of player performance than just 
                win rate or ELO alone, as it considers margin of victory and consistency.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default CalculationGuide;