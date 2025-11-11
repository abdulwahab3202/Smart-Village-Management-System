const HowItWorksSection = () => {
  const steps = [
    {
      icon: '1',
      title: 'Submit a Complaint',
      description: 'Quickly report an issue using our simple form. Add details, a location, and even upload a photo.',
    },
    {
      icon: '2',
      title: 'Work Gets Assigned',
      description: 'Your complaint is routed to the correct department, and a city worker is assigned to investigate.',
    },
    {
      icon: '3',
      title: 'Track to Resolution',
      description: 'Receive real-time status updates and notifications until the issue is marked as completed.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800">A Simple, Transparent Process</h2>
          <p className="mt-4 text-lg text-slate-600">Resolving civic issues in just three easy steps.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center h-16 w-16 mx-auto bg-indigo-100 text-indigo-600 rounded-full text-2xl font-bold mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-800">{step.title}</h3>
              <p className="mt-2 text-slate-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default HowItWorksSection;