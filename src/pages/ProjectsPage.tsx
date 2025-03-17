
import React, { useState, useEffect } from 'react';
import { FinancialGoal, ProjectPlan } from '@/types/goals';
import { mockBudget, mockAssets, mockGoals } from '@/lib/mockData';
import { Download, Plus, ShieldCheck, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectForm from '@/components/projects/ProjectForm';
import { toast } from '@/hooks/use-toast';
import { Asset } from '@/types/assets';
import ProjectsOverview from '@/components/projects/ProjectsOverview';
import ProjectsList from '@/components/projects/ProjectsList';
import ProjectDetails from '@/components/projects/ProjectDetails';
import SavingsCapacity from '@/components/projects/SavingsCapacity';
import ProjectDeleteDialog from '@/components/projects/ProjectDeleteDialog';
import SecurityCushion from '@/components/budget/SecurityCushion';
import SecurityCushionForm from '@/components/budget/SecurityCushionForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';

interface ProjectsPageProps {
  onAddAsset?: (newAsset: Omit<Asset, 'id'>) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ onAddAsset }) => {
  const [projects, setProjects] = useState<FinancialGoal[]>([]);
  const [selectedProject, setSelectedProject] = useState<FinancialGoal | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [riskProfile, setRiskProfile] = useState<'high' | 'medium' | 'low'>('medium');
  const [cushionFormOpen, setCushionFormOpen] = useState(false);
  
  // Monthly savings from budget
  const monthlySavings = mockBudget.totalIncome - mockBudget.totalExpenses;
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Calculate total from savings accounts
  const calculateSavingsTotal = () => {
    return assets
      .filter(asset => asset.type === 'savings-account')
      .reduce((sum, asset) => sum + asset.value, 0);
  };

  const savingsAccountsTotal = calculateSavingsTotal();
  
  // Calculate security cushion target
  const monthlyExpenses = mockBudget.totalExpenses;
  const recommendedMonths = 
    riskProfile === 'high' ? 3 :
    riskProfile === 'medium' ? 6 : 9;
  const targetAmount = monthlyExpenses * recommendedMonths;

  // Load projects from localStorage on initial render
  useEffect(() => {
    const savedProjects = localStorage.getItem('financial-projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      setProjects([...mockGoals]);
    }
    
    const loadAssetsFromStorage = () => {
      const storedAssets = localStorage.getItem('financial-assets');
      if (storedAssets) {
        setAssets(JSON.parse(storedAssets));
      }
    };
    
    loadAssetsFromStorage();
    
    const savedRiskProfile = localStorage.getItem('security-cushion-risk-profile');
    if (savedRiskProfile && (savedRiskProfile === 'high' || savedRiskProfile === 'medium' || savedRiskProfile === 'low')) {
      setRiskProfile(savedRiskProfile as 'high' | 'medium' | 'low');
    }
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'financial-assets') {
        loadAssetsFromStorage();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('financial-projects', JSON.stringify(projects));
  }, [projects]);
  
  const handleSelectProject = (project: FinancialGoal) => {
    setSelectedProject(project);
  };
  
  const handleAddProject = () => {
    setSelectedProject(null); // Ensure we're adding, not editing
    setIsFormOpen(true);
  };
  
  const handleEditProject = (project: FinancialGoal) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };
  
  const handleSaveProject = (projectData: Omit<FinancialGoal, 'id'> & { id?: string }) => {
    if (projectData.id) {
      // Update existing project
      setProjects(prevProjects => 
        prevProjects.map(p => p.id === projectData.id ? {...projectData as FinancialGoal} : p)
      );
      toast({
        title: "Projet mis à jour",
        description: "Votre projet a été mis à jour avec succès.",
      });
    } else {
      // Add new project
      const newProject: FinancialGoal = {
        ...projectData,
        id: Math.random().toString(36).substr(2, 9), // Simple ID generation
      };
      setProjects(prevProjects => [...prevProjects, newProject]);
      
      toast({
        title: "Projet ajouté",
        description: "Votre nouveau projet a été ajouté avec succès.",
      });
    }
    setIsFormOpen(false);
  };
  
  const handleDeleteProject = () => {
    if (projectToDelete) {
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectToDelete));
      if (selectedProject?.id === projectToDelete) {
        setSelectedProject(null);
      }
      setProjectToDelete(null);
      toast({
        title: "Projet supprimé",
        description: "Le projet a été supprimé avec succès.",
      });
    }
    setDeleteDialogOpen(false);
  };
  
  const confirmDelete = (id: string) => {
    setProjectToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const handleSelectPlan = (plan: ProjectPlan) => {
    if (!selectedProject) return;
    
    // Update the project with the selected plan
    const updatedProject: FinancialGoal = {
      ...selectedProject,
      monthlyContribution: plan.monthlyContribution
    };
    
    setProjects(prevProjects => 
      prevProjects.map(p => p.id === selectedProject.id ? updatedProject : p)
    );
    
    setSelectedProject(updatedProject);
    
    toast({
      title: "Plan appliqué",
      description: `Le plan de financement sur ${plan.timeToTarget} mois a été appliqué au projet.`,
    });
  };
  
  const handleSaveCushion = (data: {currentAmount: number, riskProfile: 'high' | 'medium' | 'low'}) => {
    setRiskProfile(data.riskProfile);
    
    localStorage.setItem('security-cushion-risk-profile', data.riskProfile);
    
    toast({
      title: "Profil de risque mis à jour",
      description: "Votre profil de risque pour le matelas de sécurité a été mis à jour avec succès.",
    });
  };
  
  const totalAllocation = projects.reduce((total, project) => total + project.monthlyContribution, 0);
  const projectsInProgress = projects.filter(p => p.currentAmount < p.targetAmount).length;
  const projectsCompleted = projects.filter(p => p.currentAmount >= p.targetAmount).length;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projets financiers</h1>
          <p className="text-muted-foreground">Planifiez et suivez vos projets et objectifs financiers</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download size={18} />
            <span>Exporter</span>
          </Button>
          <Button onClick={handleAddProject} className="gap-2">
            <Plus size={18} />
            <span>Nouveau projet</span>
          </Button>
        </div>
      </div>
      
      {/* New Savings Section */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-wealth-primary" />
            <CardTitle>Épargne</CardTitle>
          </div>
          <CardDescription>Vue d'ensemble de votre épargne et de vos objectifs financiers</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="col-span-1 p-4">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-lg">Total des livrets</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="mt-2 mb-4">
                  <div className="text-3xl font-bold text-wealth-primary">{formatCurrency(savingsAccountsTotal)}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Répartis sur {assets.filter(asset => asset.type === 'savings-account').length} livrets d'épargne
                  </p>
                </div>
                <div className="space-y-2">
                  {assets
                    .filter(asset => asset.type === 'savings-account')
                    .map(account => (
                      <div key={account.id} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="font-medium">{account.name}</span>
                        <span>{formatCurrency(account.value)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <div className="lg:col-span-2">
              <SecurityCushion 
                currentAmount={savingsAccountsTotal}
                targetAmount={targetAmount}
                expenseAmount={monthlyExpenses}
                riskProfile={riskProfile}
                onEditClick={() => setCushionFormOpen(true)}
              />
            </div>
          </div>
          
          <ProjectsList 
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={handleSelectProject}
            onAddProject={handleAddProject}
            onEditProject={handleEditProject}
            onDeleteProject={confirmDelete}
          />
        </CardContent>
      </Card>
      
      <ProjectsOverview 
        projects={projects}
        projectsInProgress={projectsInProgress}
        projectsCompleted={projectsCompleted}
        totalAllocation={totalAllocation}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* ProjectsList has been moved to the Savings section */}
        </div>
        
        <div className="space-y-6">
          <ProjectDetails 
            selectedProject={selectedProject}
            monthlySavings={monthlySavings}
            onSelectPlan={handleSelectPlan}
          />
          
          <SavingsCapacity 
            budget={mockBudget}
            totalAllocation={totalAllocation}
          />
        </div>
      </div>
      
      {/* Project Form */}
      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveProject}
        editProject={selectedProject || undefined}
        monthlySavings={monthlySavings}
      />
      
      {/* Delete Confirmation Dialog */}
      <ProjectDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={handleDeleteProject}
      />
      
      {/* Security Cushion Form */}
      <SecurityCushionForm
        isOpen={cushionFormOpen}
        onClose={() => setCushionFormOpen(false)}
        onSave={handleSaveCushion}
        currentAmount={savingsAccountsTotal}
        riskProfile={riskProfile}
      />
    </div>
  );
};

export default ProjectsPage;
