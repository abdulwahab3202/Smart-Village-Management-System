import React from 'react';

const FeaturesSection = () => {
  const features = [
    { title: 'Real-Time Tracking', description: 'Watch your complaint move from submitted to completed with live status updates.' },
    { title: 'Photo Uploads', description: 'A picture is worth a thousand words. Attach photos to provide clear evidence.' },
    { title: 'Map-Based Reporting', description: 'Pinpoint the exact location of the issue on a map for faster response.' },
    { title: 'Secure & Private', description: 'Your data is protected. We value your privacy and security.' },
    { title: 'Worker Credit System', description: 'An innovative system to motivate workers and ensure quality service.' },
    { title: 'Admin Oversight', description: 'A powerful dashboard for administrators to manage complaints and workers effectively.' },
  ];

  return (
    <section id="features" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800">A Platform Built for Action</h2>
          <p className="mt-4 text-lg text-slate-600">Everything you need to make a real impact in your community.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-xl font-semibold text-slate-800">{feature.title}</h3>
              <p className="mt-2 text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
